require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

console.log('📁 cwd:', process.cwd());
console.log('🔑 DATABASE_URL present?', !!process.env.DATABASE_URL);
console.log('🔑 First 40 chars:', process.env.DATABASE_URL?.slice(0, 40));

const sql = require('./db.js');

(async () => {
  try {
    const result = await sql`SELECT NOW() as now`;
    console.log('✅ Connected:', result[0]);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:');
    console.error(err);
    process.exit(1);
  }
})();