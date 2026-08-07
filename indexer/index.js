require("dotenv").config();
const { ethers } = require("ethers");
const { pool, initSchema } = require("./db");

const RPC_WS_URL = process.env.RPC_WS_URL;

if (!RPC_WS_URL) {
  console.error("[indexer] Missing RPC_WS_URL in .env - get one from Alchemy/Infura/QuickNode");
  process.exit(1);
}

let provider;

async function connect() {
  provider = new ethers.WebSocketProvider(RPC_WS_URL);

  provider.on("block", (blockNumber) => {
    handleBlock(blockNumber).catch((err) => {
      console.error(`[indexer] failed to process block ${blockNumber}:`, err.message);
    });
  });

  // Reconnect if the socket drops - this WILL happen, don't skip it
  provider.websocket?.on?.("close", () => {
    console.warn("[indexer] WebSocket closed, reconnecting in 3s...");
    setTimeout(connect, 3000);
  });

  console.log("[indexer] connected, listening for new blocks...");
}

async function handleBlock(blockNumber) {
  // getBlock with `true` returns full transaction objects, not just hashes
  const block = await provider.getBlock(blockNumber, true);
  if (!block) return;

  await pool.query(
    `INSERT INTO blocks (number, hash, parent_hash, timestamp, miner, gas_used, tx_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (number) DO NOTHING`,
    [
      block.number,
      block.hash,
      block.parentHash,
      block.timestamp,
      block.miner,
      block.gasUsed?.toString(),
      block.transactions.length,
    ]
  );

  for (const tx of block.prefetchedTransactions ?? block.transactions) {
    await pool.query(
      `INSERT INTO transactions (hash, block_number, from_addr, to_addr, value, gas_limit, gas_price, nonce, tx_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (hash) DO NOTHING`,
      [
        tx.hash,
        block.number,
        tx.from,
        tx.to,
        tx.value.toString(),
        tx.gasLimit?.toString(),
        tx.gasPrice?.toString(),
        tx.nonce,
        tx.index,
      ]
    );
  }

  console.log(`[indexer] block ${blockNumber} indexed - ${block.transactions.length} txs`);
}

async function main() {
  await initSchema();
  await connect();
}

main().catch((err) => {
  console.error("[indexer] fatal error:", err);
  process.exit(1);
});
