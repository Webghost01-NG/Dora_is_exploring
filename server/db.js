require("dotenv").config();
const { Pool } = require("pg");

// Reads from the SAME tables the indexer writes to (blocks, transactions).
// Also owns the `contracts` table, written to by the verifier service.
// Schema must stay in sync with /indexer/db.js - if one changes, tell the whole team.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initSchema() {
  // blocks + transactions already created by the indexer on its own boot.
  // IF THIS SERVICE STARTS FIRST (e.g. indexer isn't running yet), we still
  // need them to exist so queries don't 500 on an empty DB.
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

  // Owned by this service - stores verified contract source + ABI from Person 3's verifier
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

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_addr);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_addr);`);

  console.log("[db] schema ready");
}

module.exports = { pool, initSchema };
