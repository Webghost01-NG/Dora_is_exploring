require("dotenv").config();
const { Pool } = require("pg");

// Writes to the `contracts` table (owned by the server service's schema).
// This service assumes /server has already run initSchema() and created it -
// but we guard with CREATE TABLE IF NOT EXISTS too, in case this starts first.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contracts (
      address TEXT PRIMARY KEY,
      source_code TEXT NOT NULL,
      compiler_version TEXT NOT NULL,
      contract_name TEXT,
      abi JSONB,
      bytecode_match BOOLEAN NOT NULL DEFAULT false,
      verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log("[db] contracts table ready");
}

module.exports = { pool, initSchema };
