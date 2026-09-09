const dbConnect = require('../db/db.js');
const Bycrypt = require('bcrypt')

function CreateUsers(username, role, password) {
    const HashPassword = Bycrypt.hashSync(password, 10);
    const userTable = dbConnect.prepare('INSERT INTO users (username, role , password_hash) VALUES (?,?,?)');
    userTable.run( username ,role , HashPassword  );
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

function changePassword ( username , oldPassword , newPassword ) {
    const isCorrect = verifyPassword(username , oldPassword);
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

module.exports = { CreateUsers , findUsername , verifyPassword , changePassword ,  editUsers };

 