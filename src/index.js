const express = require('express');
const path = require('path');
const { CreateUsers } = require('../models/usermodel');
const { findUsername } = require('../models/usermodel');
const { verifyPassword } = require('../models/usermodel');
const { changePassword } = require('../models/usermodel');
const { editUsers } = require('../models/usermodel');
const session = require('express-session');

require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..' , 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// routes ----------------------------------------------
app.post('/register', ( req , res ) => {
    const { username , password } = req.body;
    CreateUsers(username, 'user' , password);
    res.send("Created succesfully");
});

app.post('/login', ( req , res ) => {
    const { username , password } = req.body;
    const isCorrect = verifyPassword( username , password );
    if (isCorrect) {
        req.session.username = username;
        res.redirect('./dashboard.html');
    } else {
        res.send("Incorrect username or password, try again!!");
    }
});

app.post('/changePass', ( req , res ) => {
    const { username , oldPassword , newPassword } =req.body;
    const success = changePassword(username , oldPassword , newPassword);
    if (success) {
        res.send("Passsword changed succesfully");
    } else {
        res.send("Username or Password is incorrect, Try again!!");
    }
});

app.post('/changeName', ( req , res) => {
    const { password , oldUsername , newUsername } = req.body;
    const changed = editUsers( password , oldUsername , newUsername );
    if (changed) {
        res.send("Username changed succesfully");
    } else {
        res.send("Incorrect old username or password, Try again!!");
    }
});

// do not tamper ------------------------------------------------------
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});