require('dotenv').config();
const express = require('express');
const path = require('path');
const {
  CreateUsers,
  findUsername,
  verifyPassword,
  changePassword,
  verifyCode,
  storedCode,
  editUsers,
} = require('../models/usermodel');
const { verificationCode } = require('../utils/mailer');
const { requireLogin } = require('../middleware/auth');
const session = require('express-session');

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'Public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/private/dashboard', requireLogin, (req, res) => {
  res.render('dashboard', { username: req.session.username });
});

app.post('/register', async (req, res) => {
  const { username, email, phone_number, password } = req.body;

  if (username.length > 20) {
    return res.send("Username should only have 20 characters");
  }

  const passwordRules = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*-]).{5,15}$/;
  if (!passwordRules.test(password)) {
    return res.send("Password must be at least 8 characters and include a capital letter, a number, and a special character");
  }

  try {
    await CreateUsers(username, email, phone_number, 'user', password);
    res.redirect('/index.html');
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') {
      return res.send("That username or email is already taken");
    }
    res.status(500).send("Something went wrong");
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const isCorrect = await verifyPassword(username, password);
    if (isCorrect) {
      req.session.username = username;
      return res.redirect('/index.html');
    }
    res.send("Incorrect username or password, try again!!");
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send("Something went wrong");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/index.html');
  });
});

app.post('/changePass', async (req, res) => {
  const { username, code, newPassword } = req.body;
  try {
    const success = await changePassword(username, code, newPassword);
    if (success) return res.send("Password changed successfully");
    res.send("Username or Password is incorrect, Try again!!");
  } catch (error) {
    console.error('changePass error:', error);
    res.status(500).send("Something went wrong");
  }
});

app.post('/forgotPass', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await findUsername(username);
    if (!user) return res.send("If that user exists, a code has been sent");
    const code = Math.floor(100000 + Math.random() * 900000);
    storedCode(username, code);
    await verificationCode(user.email, code);
    res.send("Your verification code is sent");
  } catch (error) {
    console.error('forgotPass error:', error);
    res.status(500).send("Something went wrong");
  }
});

app.post('/changeName', async (req, res) => {
  const { password, oldUsername, newUsername } = req.body;
  try {
    const changed = await editUsers(password, oldUsername, newUsername);
    if (changed) return res.send("Username changed successfully");
    res.send("Incorrect old username or password, Try again!!");
  } catch (error) {
    console.error('changeName error:', error);
    res.status(500).send("Something went wrong");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});