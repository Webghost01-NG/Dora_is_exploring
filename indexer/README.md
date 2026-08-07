# Indexer

Listens for new blocks over a WebSocket RPC connection, parses transactions, and writes them to Postgres.

## Setup

```bash
cd indexer
npm install
cp .env.example .env   # fill in your RPC_WS_URL and DB credentials
```

You need a **WebSocket** RPC URL (starts with `wss://`), not a regulayr HTTPS one - get a free one from Alchemy, Infura, or QuickNode (Sepolia testnet is a good starting network).

## Run

```bash
# make sure Postgres is running first (docker-compose up -d from /infra, once Person 5 sets it up)
npm run dev
```

You should see:
```
[db] schema ready
[indexer] connected, listening for new blocks...
[indexer] block 12345678 indexed - 143 txs
```

## What's here

- `db.js` - Postgres connection pool + schema setup (`blocks`, `transactions` tables)
- `index.js` - WebSocket block listener, parses and inserts each new block

## Not yet handled (next steps)

- **Reorg handling** - if  block gets replaced, we don't currently detect/roll it back. Fine for a demo, flag it as a known limitation.
- **Backfilling past blocks** - this only indexes blocks from the moment it starts running. To backfill history, loop `provider.getBlock()` from a start block number down/up.
- **Retry/backoff on RPC errors** - currently just logs and moves on to the next block.

## Schema note

This schema needs to match whatever the backend/API service expects. If Person 2 changes it on their end, update `db.js` here too.
