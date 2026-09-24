// db.js
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,                 // required for Vercel serverless
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,         // required for Supabase transaction pooler
});

module.exports = sql;