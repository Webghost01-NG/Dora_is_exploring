# Dora the Explorer — Backend API

Express REST API + WebSocket feed. Reads whatever the indexer has written to
Postgres and serves it to both frontend builds (search/browse and live/address).

## Setup

```bash
npm install
cp .env.example .env
```

Requires the shared Postgres to be running (`infra/docker-compose.yml` from
Person 5's part — `cd infra && docker-compose up -d`).

## Run

```bash
npm run dev
```

You should see:
```
[server] REST API listening on :3001
[db] schema ready
```

If you see `ECONNREFUSED 127.0.0.1:5432` instead, Postgres isn't running yet —
that's expected behavior, not a bug. Start the DB first.

## Verified working

Ran `node --check` on both files (clean) and booted the server standalone —
it listens correctly and fails gracefully (clear error, no crash) when the DB
isn't reachable yet.

## Endpoints

| Method | Path | Used by |
|---|---|---|
| GET | `/blocks?limit=15` | frontend-search home trail |
| GET | `/block/:number` | frontend-search block detail |
| GET | `/tx/:hash` | frontend-search tx detail |
| GET | `/address/:addr` | frontend-live address page |
| GET | `/search?q=` | optional server-side redirect |
| GET | `/health` | uptime check |
| WS | `/` (same port) | frontend-live ticker — broadcasts `{ type: "block", data: {...} }` |

## How live updates work

The indexer writes directly to Postgres and doesn't know this server exists.
This server polls for the latest block number every 3 seconds and broadcasts
over WebSocket whenever it changes. Simple and reliable for a hackathon demo.
(For something more real-time/production-grade, swap the poll for Postgres
`LISTEN/NOTIFY` triggered from the indexer's insert.)

## Address balance caveat

`/address/:addr` derives balance from the net sum of indexed transaction values
only — it is **not** a live on-chain `eth_getBalance` call. This is documented
so nobody's surprised when it doesn't match a wallet's real balance. Fine for
demo purposes; flag it if judges ask.

## Schema

Owns the `contracts` table (written to by Person 3's verifier service) in
addition to reading `blocks`/`transactions` written by the indexer. If you
change any table shape, update `db.js` here, `indexer/db.js`, and tell the team.
