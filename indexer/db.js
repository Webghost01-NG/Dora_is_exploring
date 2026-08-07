require("dotenv").config();
const { Pool } = require("pg");

// Single shared connection pool - reused across the app instead of
// opening a new connection per query (expensive and unnecessary)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Creates tables if they don't already exist.
// Coordinate this schema with the backend/API person - both services read/write the same tables.
async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blocks (
      number BIGINT PRIMARY KEY,
      hash TEXT UNIQUE NOT NULL,
      parent_hash TEXT NOT NULL,
      timestamp BIGINT NOT NULL,
      miner TEXT,
      gas_used TEXT,
      tx_count INT NOT NULL DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      hash TEXT PRIMARY KEY,
      block_number BIGINT NOT NULL REFERENCES blocks(number) ON DELETE CASCADE,
      from_addr TEXT NOT NULL,
      to_addr TEXT,
      value TEXT NOT NULL,
      gas_limit TEXT,
      gas_price TEXT,
      nonce INT,
      tx_index INT
    );
  `);

  // Speeds up address lookups (Person 2's API will query these a lot)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_addr);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_addr);`);

  console.log("[db] schema ready");
}

module.exports = { pool, initSchema };
