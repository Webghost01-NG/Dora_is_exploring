# Dora the Explorer — Live Feed / Address / Infra

The real-time half of the frontend, plus the shared local infrastructure: a
WebSocket-driven live block ticker, address detail pages, and the Docker Compose
setup everyone's `indexer` and `server` connect to.

## What's here

```
frontend-live/
├── src/            # React app — live ticker + address pages
├── infra/          # docker-compose.yml for shared Postgres
└── docs/           # infra setup instructions
```

## Design

Same design system as the search/browse build — deep jungle-navy, brass trail
markers, Fraunces/Work Sans/JetBrains Mono. The live-connection dot pulses teal
when connected, turns rust and shows a retry state if the socket drops.

## 1. Start the shared database

```bash
cd infra
docker-compose up -d
```
See `docs/infra-setup.md` for troubleshooting.

## 2. Run the app

```bash
npm install
cp .env.example .env
npm run dev
```
Opens at `http://localhost:5173` (or whatever port is free if the search build
is also running locally — Vite will auto-increment).

## 3. Verify it builds clean

```bash
npm run build
```
Should complete with `✓ built in ...s` and no errors.

## Expected backend contract

- **WebSocket** at `VITE_WS_URL` (default `ws://localhost:3001`) — the live view
  expects messages shaped like:
  ```json
  { "type": "block", "data": { "number": 123, "hash": "0x...", "timestamp": 1234567890, "tx_count": 5 } }
  ```
  This needs to be added to Person 2's Express server (a `ws` server alongside the
  REST API, broadcasting whenever the indexer inserts a new block).

- **REST** `GET /address/:addr` → `{ balance, transactions: [{ hash, from_addr, to_addr, value, timestamp }] }`

## Not yet handled

- If the WebSocket message shape from the backend ends up different, update the
  `onmessage` handler in `src/useLiveBlocks.js` — everything else reads from state,
  so that's the only file that needs to change.
- Pagination on address transaction history (currently shows whatever the API returns).
- Reconnect currently retries every 3s indefinitely — fine for a demo, would want a
  backoff/cap for production.
