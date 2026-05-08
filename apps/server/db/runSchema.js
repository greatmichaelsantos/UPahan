require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runSchema() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Schema created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error running schema:', err);
    process.exit(1);
  }
}

runSchema();
