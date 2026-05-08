require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'upahan_db',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT) || 5432,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

module.exports = pool;
