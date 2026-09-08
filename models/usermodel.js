const dbConnect = require('../db/db.js');
const Bycrypt = require('bcrypt')

function CreateUsers(username, role, password) {
    const HashPassword = Bycrypt.hashSync(password, 10);
    const userTable = dbConnect.prepare('INSERT INTO users (username, role , password_hash) VALUES (?,?,?)');
    userTable.run( username ,role , HashPassword  );
}
module.exports = {CreateUsers};



function ediUsers () {

}