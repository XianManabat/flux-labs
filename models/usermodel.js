const dbConnect = require('../db/db.js');
const Bycrypt = require('bcrypt');
const { verificationCode } = require('../utils/mailer.js');
const verificationCodes = {};

async function CreateUsers(username, email, phone_number, role, password) {
    const HashPassword = Bycrypt.hashSync(password, 10);
    // FIX: replaced dbConnect.prepare().run() (better-sqlite3 syntax) with
    // dbConnect.execute({sql, args}) (Turso syntax). Added async/await since
    // Turso calls are asynchronous.
    await dbConnect.execute({
        sql: 'INSERT INTO users (username, email, phone_number, role, password_hash) VALUES (?,?,?,?,?)',
        args: [username, email, phone_number, role, HashPassword]
    });
}

async function findUsername(username) {
    // FIX: replaced dbConnect.prepare().get() with dbConnect.execute().
    // Turso returns result.rows (an array) instead of a single row directly,
    // so we grab rows[0] to mimic the old .get() behavior.
    const result = await dbConnect.execute({
        sql: 'SELECT * FROM users WHERE username = ?',
        args: [username]
    });
    return result.rows[0];
}

async function verifyPassword(username, password) {
    // FIX #1: added "await" before findUsername() — without it, "user" was
    // a pending Promise, not the actual row, causing "Cannot read properties
    // of undefined" crashes.
    const user = await findUsername(username);
    // FIX #2: added this existence check. If no user matches the given
    // username, findUsername returns undefined, and the next line would
    // crash trying to read .password_hash off undefined. This was the exact
    // crash you hit when testing login with a non-existent user.
    if (!user) {
        return false;
    }
    const matched = Bycrypt.compareSync(password, user.password_hash);
    return matched;
}

function storedCode(username, code) {
    // No fix needed — doesn't touch the database, stays synchronous.
    verificationCodes[username] = code;
}

function verifyCode(username, code) {
    // No fix needed — same reason as above.
    const stored = verificationCodes[username];
    return stored == code;
}

async function changePassword(username, code, newPassword) {
    const isCorrect = verifyCode(username, code);
    if (!isCorrect) {
        return false;
    }
    const newPass = Bycrypt.hashSync(newPassword, 10);
    // FIX: replaced dbConnect.prepare().run() with dbConnect.execute().
    // Also removed the old addnewPass.run(newPass, username) line that
    // came after "return true" — that line could never run (dead code
    // after a return) and would have errored anyway since Turso's
    // execute() result has no .run() method.
    await dbConnect.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE username = ?',
        args: [newPass, username]
    });
    return true;
}

async function editUsers(password, oldUsername, newUsername) {
    // FIX: added "await" — verifyPassword is now async and returns a
    // Promise, so calling it without await would make isCorrect always
    // "truthy" (a Promise object), letting this check pass incorrectly.
    const isCorrect = await verifyPassword(oldUsername, password);
    if (!isCorrect) {
        return false;
    }
    // FIX: replaced dbConnect.prepare().run() with dbConnect.execute().
    await dbConnect.execute({
        sql: 'UPDATE users SET username = ? WHERE username = ?',
        args: [newUsername, oldUsername]
    });
    return true;
}

module.exports = { CreateUsers, findUsername, verifyPassword, changePassword, editUsers, verifyCode, storedCode };