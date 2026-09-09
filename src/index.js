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
    const { username , email , phone_number , password } = req.body;
    
    if (username.length > 20) {
        return res.send("Username should only have 20 characters")
    } else {
        const passwordRules = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRules.test(password)) {
                return res.send("Password must be at least 8 characters and include a capital letter, a number, and a special character");
        } else {
            CreateUsers(username , email , phone_number , 'user' , password);
                res.send(` Welcome ${username}`);
        }
    }
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