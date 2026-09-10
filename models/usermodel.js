// wag gagalawin ----------------------------------------------
// wag gagalawin ----------------------------------------------
// wag gagalawin ----------------------------------------------

const dbConnect = require('../db/db.js');
const Bycrypt = require('bcrypt');
const { verificationCode } = require('../utils/mailer.js');
const verificationCodes = {};


function CreateUsers (username , email , phone_number , role, password ) {
    const HashPassword = Bycrypt.hashSync(password, 10);
    const userTable = dbConnect.prepare('INSERT INTO users ( username , email , phone_number, role , password_hash ) VALUES (?,?,?,?,?)');
    userTable.run( username , email , phone_number, role , HashPassword  );
}

function findUsername(username) {
    const usernamFinder = dbConnect.prepare('SELECT * FROM users WHERE username = ?');
    const user = usernamFinder.get(username);
    return user;
}

function verifyPassword ( username , password ) {
    const user = findUsername(username);    
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

 
function changePassword ( username , code , newPassword ) {
    const isCorrect = verifyCode( username , code );
    if (!isCorrect) {
        return false;
    }
    const newPass = Bycrypt.hashSync(newPassword , 10);
    const addnewPass = dbConnect.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
    addnewPass.run(newPass , username);
    return true;
}



function editUsers( password , oldUsername , newUsername ) {
    const isCorrect = verifyPassword( oldUsername , password);
    if (!isCorrect) {
        return false;
    }
    const newName = dbConnect.prepare('UPDATE users SET username = ? WHERE username = ?');
    newName.run(newUsername , oldUsername);
    return true;
}

module.exports = { CreateUsers , findUsername , verifyPassword , changePassword ,  editUsers , verifyCode , storedCode};

 