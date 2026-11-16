// wag gagalawin ----------------------------------------------
// wag gagalawin ----------------------------------------------
// wag gagalawin ----------------------------------------------
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
const { maintenanceGate } = require('../middleware/maintenance');   // NEW
const { seedDefaultAdmin , setupAdmin } = require('../models/adminmodel');   // NEW
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(maintenanceGate);   // NEW: must be after session, before static
app.use(express.static(path.join(__dirname, '..' , 'public')));
app.use('/private' , requireLogin , express.static(path.join(__dirname,'..','/private')));

// routes ----------------------------------------------

// Registration ----------------------------------------
app.post('/register', ( req , res ) => {
    const { username , email , phone_number , password } = req.body;

    if (username.length > 20) {
        return res.send("Username should only have 20 characters")
    } else {
        const passwordRules = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*-]).{5,15}$/;

        if (!passwordRules.test(password)) {
            return res.send("Password must be at least 8 characters and include a capital letter, a number, and a special character");
        } else {
            CreateUsers(username , email , phone_number , 'user' , password);
            res.send(` Welcome ${username}`);
        }
    }
});

// Login / Logout --------------------------------------
app.post('/login', ( req , res ) => {
    const { username , password } = req.body;
    const isCorrect = verifyPassword( username , password );

    if (isCorrect) {
        const user = findUsername(username);   // NEW
        req.session.username = username;
        req.session.role = user.role;          // NEW: gate reads this
        res.redirect('./private/dashboard.html');
    } else {
        res.send("Incorrect username or password, try again!!");
    }
});

app.get('/logout' , ( req , res) => {
    req.session.destroy(() => {
        res.redirect('/index.html');
    })
});

// Admin setup (replaces the default admin credentials) -- NEW
app.post('/admin-setup', ( req , res ) => {
    if (req.session.role !== 'admin') {
        return res.status(403).send("Admins only");
    }
    const { newUsername , newPassword } = req.body;

    if (newUsername === process.env.ADMIN_USER) {
        return res.send("Choose a different username than the default");
    }
    const ok = setupAdmin( req.session.username , newUsername , newPassword );

    if (ok) {
        req.session.username = newUsername;
        res.redirect('/private/dashboard.html');
    } else {
        res.send("Username already taken");
    }
});

// Password reset --------------------------------------
app.post('/forgotPass' , (req , res) => {
    const { username } = req.body;
    const user = findUsername(username);
    const code = Math.floor(100000 + Math.random() * 900000);

    storedCode( username , code);
    verificationCode( user.email , code )
    res.send("Your verification code is sent")
});

app.post('/changePass', ( req , res ) => {
    const { username , code , newPassword } = req.body;
    const success = changePassword( username , code , newPassword);

    if (success) {
        res.send("Passsword changed succesfully");
    } else {
        res.send("Username or Password is incorrect, Try again!!");
    }
});

// Account settings ------------------------------------
app.post('/changeName', ( req , res) => {
    const { password , oldUsername , newUsername } = req.body;
    const changed = editUsers( password , oldUsername , newUsername );

    if (changed) {
        res.send("Username changed succesfully");
    } else {
        res.send("Incorrect old username or password, Try again!!");
    }
});

// Startup ---------------------------------------------
seedDefaultAdmin();   // NEW: creates the default admin once, if none exists

// do not tamper ------------------------------------------------------
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});