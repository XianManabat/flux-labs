const dbConnect = require('../db/db.js');
const Bycrypt = require('bcrypt');
const { CreateUsers , findUsername } = require('./usermodel');

function seedDefaultAdmin() {
    const hasAdmin = dbConnect.prepare("SELECT 1 FROM users WHERE role = 'admin'").get();
    if (hasAdmin) {
        return;
    }
    CreateUsers( process.env.ADMIN_USER , 'admin@local' , '' , 'admin' , process.env.ADMIN_PASS );
}

function setupAdmin( oldUsername , newUsername , newPassword ) {
    if (findUsername(newUsername)) {
        return false;
    }
    const hash = Bycrypt.hashSync(newPassword , 10);
    dbConnect.prepare('UPDATE users SET username = ?, password_hash = ? WHERE username = ? AND role = ?')
        .run(newUsername , hash , oldUsername , 'admin');
    return true;
}

module.exports = { seedDefaultAdmin , setupAdmin };