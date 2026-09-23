require('dotenv').config();
const express = require('express');
const path = require('path');
const { CreateUsers } = require('../models/usermodel');
const { findUsername } = require('../models/usermodel');
const { verifyPassword } = require('../models/usermodel');
const { changePassword } = require('../models/usermodel');
const { verifyCode } = require('../models/usermodel');
const { storedCode } = require('../models/usermodel');
const { editUsers } = require('../models/usermodel');
const { verificationCode } = require('../utils/mailer')
const { requireLogin } = require('../middleware/auth')
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'Public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/private/dashboard', requireLogin, (req, res) => {
    res.render('portfolio/dashboard', { username: req.session.username });
});

app.post('/register', async (req, res) => {
    // FIX: added "async" to this route handler — it now awaits CreateUsers.
    const { username, email, phone_number, password } = req.body;
    if (username.length > 20) {
        return res.send("Username should only have 20 characters")
    } else {
        const passwordRules = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*-]).{5,15}$/;
        if (!passwordRules.test(password)) {
            return res.send("Password must be at least 8 characters and include a capital letter, a number, and a special character");
        } else {
            try {
                // FIX: added "await" — without it, res.redirect would fire
                // before the database insert actually finished.
                await CreateUsers(username, email, phone_number, 'user', password);
                res.redirect('/index.html')
            } catch (error) {
                res.send("That username or email is already taken");
            }
        }
    }
});

app.post('/login', async (req, res) => {
    // FIX: added "async" — this route now awaits verifyPassword.
    const { username, password } = req.body;
    // FIX: added "await" before verifyPassword().
    const isCorrect = await verifyPassword(username, password);
    if (isCorrect) {
        req.session.username = username;
        // FIX: changed from res.redirect('./views/index.ejs') — that was
        // never a real, browser-reachable URL (it's a server-side template
        // file path, not a route). Redirecting there caused "Cannot GET
        // /views/index.ejs". /private/dashboard is an actual route defined
        // above.
        res.redirect('/private/dashboard');
    } else {
        res.send("Incorrect username or password, try again!!");
    }
});

app.get('/logout', (req, res) => {
    // No fix needed — no database call here.
    req.session.destroy(() => {
        res.redirect('/index.html');
    })
});

app.post('/changePass', async (req, res) => {
    // FIX: added "async" and "await" — same pattern as above.
    const { username, code, newPassword } = req.body;
    const success = await changePassword(username, code, newPassword);
    if (success) {
        res.send("Passsword changed succesfully");
    } else {
        res.send("Username or Password is incorrect, Try again!!");
    }
});

app.post('/forgotPass', async (req, res) => {
    // FIX: added "async" and "await" before findUsername().
    const { username } = req.body;
    const user = await findUsername(username);
    // FIX: added this check. Previously, if no user matched, the code went
    // straight to user.email and would have crashed on undefined, same bug
    // class as verifyPassword's crash.
    if (!user) {
        return res.send("No account with that username");
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    storedCode(username, code);
    verificationCode(user.email, code)
    res.send("Your verification code is sent")
});

app.post('/changeName', async (req, res) => {
    // FIX: added "async" and "await" — same pattern as above.
    const { password, oldUsername, newUsername } = req.body;
    const changed = await editUsers(password, oldUsername, newUsername);
    if (changed) {
        res.send("Username changed succesfully");
    } else {
        res.send("Incorrect old username or password, Try again!!");
    }
});

// FIX (from earlier in our conversation): app.listen() only runs locally now
// (guarded by NODE_ENV check), and app is exported so Vercel can use it as
// a serverless function instead of a persistent server.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`)
    });
};
module.exports = app;