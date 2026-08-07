require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { pool, initSchema } = require("./db");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

// ---------- helpers ----------

function serializeBlock(row) {
  return {
    number: Number(row.number),
    hash: row.hash,
    parent_hash: row.parent_hash,
    timestamp: Number(row.timestamp),
    miner: row.miner,
    gas_used: row.gas_used,
    tx_count: row.tx_count,
  };
}

function serializeTx(row) {
  return {
    hash: row.hash,
    block_number: Number(row.block_number),
    from_addr: row.from_addr,
    to_addr: row.to_addr,
    value: row.value,
    gas_limit: row.gas_limit,
    gas_price: row.gas_price,
    nonce: row.nonce,
    tx_index: row.tx_index,
  };
}

// ---------- routes ----------

// GET /blocks?limit=15  -> used by frontend-search's home trail
app.get("/blocks", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 15, 100);
  try {
    const { rows } = await pool.query(
      `SELECT * FROM blocks ORDER BY number DESC LIMIT $1`,
      [limit]
    );
    res.json(rows.map(serializeBlock));
  } catch (err) {
    console.error("[GET /blocks]", err.message);
    res.status(500).json({ error: "Failed to fetch blocks" });
  }
});

// GET /block/:number -> block detail + its transactions
app.get("/block/:number", async (req, res) => {
  const number = Number(req.params.number);
  if (!Number.isInteger(number)) {
    return res.status(400).json({ error: "Invalid block number" });
  }

  try {
    const blockResult = await pool.query(`SELECT * FROM blocks WHERE number = $1`, [number]);
    if (blockResult.rows.length === 0) {
      return res.status(404).json({ error: "Block not found" });
    }

    const txResult = await pool.query(
      `SELECT * FROM transactions WHERE block_number = $1 ORDER BY tx_index ASC`,
      [number]
    );

    res.json({
      ...serializeBlock(blockResult.rows[0]),
      transactions: txResult.rows.map(serializeTx),
    });
  } catch (err) {
    console.error("[GET /block/:number]", err.message);
    res.status(500).json({ error: "Failed to fetch block" });
  }
});

// GET /tx/:hash -> transaction detail
app.get("/tx/:hash", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM transactions WHERE hash = $1`, [req.params.hash]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(serializeTx(rows[0]));
  } catch (err) {
    console.error("[GET /tx/:hash]", err.message);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// GET /address/:addr -> balance (derived from tx values) + tx history
app.get("/address/:addr", async (req, res) => {
  const addr = req.params.addr.toLowerCase();

  try {
    const { rows } = await pool.query(
      `SELECT * FROM transactions
       WHERE LOWER(from_addr) = $1 OR LOWER(to_addr) = $1
       ORDER BY block_number DESC LIMIT 50`,
      [addr]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No activity found for this address" });
    }

    // NOTE: this is a naive net-flow balance derived only from indexed tx values,
    // not a live on-chain balance call. Good enough for a demo; swap for a real
    // eth_getBalance RPC call if accuracy matters more than indexer independence.
    let balance = 0n;
    for (const tx of rows) {
      const value = BigInt(tx.value || "0");
      if (tx.to_addr?.toLowerCase() === addr) balance += value;
      if (tx.from_addr?.toLowerCase() === addr) balance -= value;
    }

    res.json({
      address: req.params.addr,
      balance: balance.toString(),
      transactions: rows.map(serializeTx),
    });
  } catch (err) {
    console.error("[GET /address/:addr]", err.message);
    res.status(500).json({ error: "Failed to fetch address" });
  }
});

// GET /search?q=  -> used if a frontend wants server-side type detection too
app.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();

  if (/^\d+$/.test(q)) {
    return res.redirect(`/block/${q}`);
  }
  if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
    return res.redirect(`/tx/${q}`);
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
    return res.redirect(`/address/${q}`);
  }

  res.status(400).json({ error: "Unrecognized search query" });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---------- server + websocket ----------

const server = app.listen(PORT, () => {
  console.log(`[server] REST API listening on :${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  console.log("[ws] client connected");
  socket.on("close", () => console.log("[ws] client disconnected"));
});

function broadcast(payload) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(message);
  });
}

// The indexer writes to Postgres directly and doesn't know about this server,
// so we poll for the latest block number and broadcast whenever it changes.
// Simple and reliable for a hackathon; swap for LISTEN/NOTIFY if you want push-based.
let lastSeenBlock = null;

async function pollForNewBlocks() {
  try {
    const { rows } = await pool.query(`SELECT * FROM blocks ORDER BY number DESC LIMIT 1`);
    if (rows.length === 0) return;

    const latest = rows[0];
    if (lastSeenBlock === null) {
      lastSeenBlock = Number(latest.number);
      return; // don't broadcast on first boot, only genuinely new blocks
    }

    if (Number(latest.number) > lastSeenBlock) {
      lastSeenBlock = Number(latest.number);
      broadcast({ type: "block", data: serializeBlock(latest) });
      console.log(`[ws] broadcast block #${lastSeenBlock}`);
    }
  } catch (err) {
    console.error("[poll]", err.message);
  }
}

setInterval(pollForNewBlocks, 3000);

initSchema().then(pollForNewBlocks).catch((err) => {
  console.error("[server] fatal error during schema init:", err);
  process.exit(1);
});
