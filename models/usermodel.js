const sql = require('../db/db.js');
const bcrypt = require('bcrypt');
const { verificationCode } = require('../utils/mailer.js');

const verificationCodes = {};

async function CreateUsers(username, email, phone_number, role, password) {
  const hash = await bcrypt.hash(password, 10);
  await sql`
    INSERT INTO users (username, email, phone_number, role, password_hash)
    VALUES (${username}, ${email}, ${phone_number}, ${role}, ${hash})
  `;
}

async function findUsername(username) {
  const [user] = await sql`
    SELECT * FROM users WHERE username = ${username}
  `;
  return user;   // undefined if not found
}

async function verifyPassword(username, password) {
  const user = await findUsername(username);
  if (!user) return false;
  return bcrypt.compare(password, user.password_hash);
}

function storedCode(username, code) {
  verificationCodes[username] = code;
}

function verifyCode(username, code) {
  return verificationCodes[username] == code;
}

async function changePassword(username, code, newPassword) {
  if (!verifyCode(username, code)) return false;

  const hash = await bcrypt.hash(newPassword, 10);
  const result = await sql`
    UPDATE users SET password_hash = ${hash} WHERE username = ${username}
  `;
  return result.count > 0;
}

async function editUsers(password, oldUsername, newUsername) {
  const isCorrect = await verifyPassword(oldUsername, password);
  if (!isCorrect) return false;

  try {
    const result = await sql`
      UPDATE users SET username = ${newUsername} WHERE username = ${oldUsername}
    `;
    return result.count > 0;
  } catch (err) {
    if (err.code === '23505') return false;   // new username already taken
    throw err;
  }
}

module.exports = {
  CreateUsers,
  findUsername,
  verifyPassword,
  changePassword,
  editUsers,
  verifyCode,
  storedCode,
};