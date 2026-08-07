# Dora the Explorer — Search / Block / Transaction UI

The search-and-browse half of the frontend: a compass-style search bar that detects what
you typed (block number or tx hash), a live trail of recently indexed blocks, and
detail pages for each block and transaction.

## Design

Expedition/trail-map theme — deep jungle-navy background, brass trail markers, parchment
text. Recent blocks render as waypoints along a dotted trail rather than a plain table.
Fonts: Fraunces (display), Work Sans (body), JetBrains Mono (hashes/data).

## Setup

```bash
npm install
cp .env.example .env
```

By default it points at `http://localhost:3001` — update `VITE_API_URL` in `.env` if
Person 2's backend runs somewhere else.

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`. It will show "Trail's gone cold" states gracefully if
the backend isn't running yet — this is expected until Person 2's API and Person 1's
indexer are both up.

## Build (verify no errors)

```bash
npm run build
```

Should complete with `✓ built in ...s` and no errors.

## Expected API endpoints (from Person 2)

- `GET /blocks?limit=15` → array of `{ number, hash, timestamp, tx_count }`
- `GET /block/:number` → block object, optionally with `transactions: []`
- `GET /tx/:hash` → `{ hash, block_number, from_addr, to_addr, value, gas_limit, nonce }`

If field names differ (e.g. `blockNumber` vs `block_number`), the components already read
both — coordinate with Person 2 if you add new fields.

## Pages

- `/` — search bar + recent blocks trail
- `/block/:number` — block detail + its transactions
- `/tx/:hash` — transaction detail

## Not yet handled

- Address pages — routed to in the search bar but intentionally deferred to the
  live/address build (Person 5's part)
- Pagination on the block trail (currently shows latest 15 only)
