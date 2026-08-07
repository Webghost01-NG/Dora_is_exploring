# 🔍 Dora the Explorer

A blockchain explorer built from scratch — no wrapped Etherscan API, no shortcuts.
Custom block indexing, contract verification, and live real-time search, built by a
5-person team.

## What it does

- Indexes blocks and transactions directly from an RPC node in real time
- Serves them through a REST API and a live WebSocket feed
- Verifies smart contract source code against on-chain bytecode
- Two frontends: one for searching/browsing, one for the live ticker + address lookups

## Design

Expedition/trail-map theme. Recently indexed blocks appear as waypoints along a
trail rather than a plain table — the visual language leans into what a block
explorer actually is: tracing a path through data.

- Background: deep jungle-navy `#0D1B1E` · Panel: moss `#142B24` · Text: parchment `#F1E9D2`
- Accent: compass brass `#C9962B` · Secondary: river teal `#3FA796` · Alert: rust `#B5502F`
- Fonts: Fraunces (display), Work Sans (body), JetBrains Mono (hashes/data)

## Team & repo map

| Folder         | Owner    | What it does                                                            |
| -------------- | -------- | ----------------------------------------------------------------------- |
| `/indexer`     | Person 1 | Listens for new blocks via RPC WebSocket, writes to Postgres            |
| `/server`      | Person 2 | Express REST API + WebSocket broadcast, reads from Postgres             |
| | `/verifier`    | Person 3 — Manoah (JM-19G) | Compiles submitted Solidity source, checks it against on-chain bytecode |
| `/client`      | Person 4 | React frontend — search bar, block detail, transaction detail           |
| `/client-live` | Person 5 | React frontend — live block ticker, address pages                       |
| `/infra`       | Person 5 | Docker Compose for shared local Postgres                                |
| `/docs`        | Person 5 | Setup notes                                                             |

Each service is self-contained with its own `package.json`, `.env.example`, and
README — you never need to touch another person's folder to build your own.

## Architecture

```
RPC Node (Sepolia testnet)
    │
    ▼
/indexer  ──writes──▶  Postgres (shared, via /infra)
                            │
                            ├──reads──▶ /server (REST API + WebSocket)
                            │                │
                            │                ├──▶ /client       (search/browse)
                            │                └──▶ /client-live  (live/address)
                            │
                            └──reads/writes──▶ /verifier (contract verification)
```

The indexer and server don't talk to each other directly — they only share the
database. The server polls Postgres for new blocks every 3 seconds and pushes
them to connected frontends over WebSocket.

## Getting started (full stack, in order)

### 1. Start the shared database

```bash
cd infra
docker-compose up -d
docker ps   # confirm dora-explorer-db is running
```

### 2. Start the indexer

```bash
cd indexer
npm install
cp .env.example .env   # fill in RPC_WS_URL (wss://... from Alchemy/Infura/QuickNode, Sepolia testnet)
npm run dev
```
Wait until you see `[indexer] block #XXXXXXX indexed` before moving on.

### 3. Start the backend API

```bash
cd server
npm install
cp .env.example .env   # defaults match infra's Postgres config, shouldn't need changes
npm run dev
```
Confirm it works: open `http://localhost:3001/blocks` in a browser — you should see JSON.

### 4. Start the verifier (independent, can run anytime after step 1)

```bash
cd verifier
npm install
cp .env.example .env   # fill in RPC_HTTP_URL (plain https, a public one is pre-filled to start)
npm run dev
```

### 5. Start the frontends

```bash
cd client
npm install
cp .env.example .env
npm run dev   # localhost:5173
```

```bash
cd client-live
npm install
cp .env.example .env
npm run dev   # Vite will pick the next free port, e.g. localhost:5174
```

### You're done when

- `indexer` terminal shows new blocks logging
- `http://localhost:3001/blocks` returns real block data
- `client` shows blocks in the trail and lets you click into detail pages
- `client-live` shows the same blocks arriving live, with the connection dot pulsing teal

## Environment variables reference

| Service         | Variable                                                      | Example                                                     |
| --------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| indexer         | `RPC_WS_URL`                                                  | `wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`               |
| indexer, server | `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `localhost` / `5432` / `explorer` / `postgres` / `postgres` |
| verifier        | `RPC_HTTP_URL`                                                | `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`             |
| client          | `VITE_API_URL`                                                | `http://localhost:3001`                                     |
| client-live     | `VITE_API_URL` / `VITE_WS_URL`                                | `http://localhost:3001` / `ws://localhost:3001`             |

All of these already have `.env.example` files in their respective folders —
copy and fill in, never commit the real `.env`.

## Git workflow

Never commit directly to `main`. Each person works in their own folder on their
own branch:

```bash
git checkout main
git pull origin main
git checkout -b your-feature-name
# ... make changes inside your folder only ...
git add your-folder/
git commit -m "feat: description"
git push origin your-feature-name
```

Open a PR into `main`, link the issue with `Closes #N`, and merge once it's
reviewed. Because everyone stays inside their own folder, merge conflicts
should not happen — if you see one, you've likely edited a file outside your
assigned folder.

## Known limitations (be upfront about these)

- **No reorg handling** in the indexer — fine for a short demo window on
  testnet, flagged as a known gap.
- **Address balances are derived from indexed transaction sums**, not a live
  `eth_getBalance` call — won't exactly match a wallet's real balance.
- **Contract verification is single-file only** — no import resolution for
  multi-file projects (e.g. OpenZeppelin imports need flattening first).
- **Live updates are poll-based** (every 3s), not push-based from the indexer —
  simple and reliable for a hackathon, not the lowest-latency approach possible.

## Stack

Node.js, Express, Ethers.js v6, PostgreSQL, WebSockets (`ws`), React (JavaScript,
Vite), solc. No TypeScript, no ORM — plain SQL and plain JS throughout.