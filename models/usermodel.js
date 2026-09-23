// wag gagalawin ----------------------------------------------
// wag gagalawin ----------------------------------------------
// wag gagalawin ----------------------------------------------
const { createClient } = require('@libsql/client');
const dbConnect = require('../db/db.js');
const Bycrypt = require('bcrypt');
const { verificationCode } = require('../utils/mailer.js');
const verificationCodes = {};


async function CreateUsers (username , email , phone_number , role, password ) {
    const HashPassword = Bycrypt.hashSync(password, 10);
    await dbConnect.execute({
        sql: 'INSERT INTO users (username, email, phone_number, role, password_hash) VALUES (?,?,?,?,?)',
        args: [username, email, phone_number, role, HashPassword]
    });
    
}

async function findUsername(username) {
    const result = await dbConnect.execute({
        sql: 'SELECT * FROM users WHERE username = ?',
        args: [username]
    });
    return result.rows[0];
}

async function verifyPassword ( username , password ) {
    const user = await findUsername(username);    
    const matched = Bycrypt.compareSync(password , user.password_hash);
    return matched;
}



function storedCode( username , code ) {
    verificationCodes[username] = code;
};
function verifyCode ( username , code ) {
    const storedCode = verificationCodes[username];
    if (storedCode == code ) {
        return true;
    } else {
        return false;
    }
    
};

 
async function changePassword ( username , code , newPassword ) {
    const isCorrect = verifyCode( username , code );
    if (!isCorrect) {
        return false;
    }
    const newPass = Bycrypt.hashSync(newPassword , 10);
    const addnewPass = await dbConnect.execute ({
        sql: 'UPDATE users SET password_hash = ? WHERE username = ?',
        args: [newPass , username]
    });
    return true;
    addnewPass();
}



async function editUsers( password , oldUsername , newUsername ) {
    const isCorrect = verifyPassword( oldUsername , password);
    if (!isCorrect) {
        return false;
    }
    const newName = dbConnect.prepare('UPDATE users SET username = ? WHERE username = ?');
    newName.run(newUsername , oldUsername);
    return true;
}

module.exports = { CreateUsers , findUsername , verifyPassword , changePassword ,  editUsers , verifyCode , storedCode};

 