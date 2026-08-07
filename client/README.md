# Dora the Explorer — Client (Unified)

The full frontend — merged from the two separately-built pieces (search/browse
and live/address) into one app with one router, one nav bar, one build.

## Pages

| Route | What it shows |
|---|---|
| `/` | Compass search bar + trail of recently indexed blocks |
| `/live` | Live-updating ticker via WebSocket, connection status dot |
| `/block/:number` | Block detail + its transactions |
| `/tx/:hash` | Transaction detail |
| `/address/:addr` | Balance + transaction history for an address |

The nav bar (top right) switches between Search and Live. The search bar
detects what you typed — block number, tx hash, or address — and routes
to the right page automatically.

## Setup

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```
Opens at `http://localhost:5173`.

## Build (verify no errors)

```bash
npm run build
```
Confirmed working: `✓ 42 modules transformed`, `✓ built in ~2s`, no errors.

## Backend dependency

Needs `/server` running (REST API + WebSocket) for real data. Without it, every
page shows a graceful "Trail's gone cold" state rather than crashing — useful
for developing the UI before the backend is ready.

## What changed in the merge

- Combined both apps' `App.jsx` into one router with a shared nav bar
- Search bar's address input now navigates directly to `/address/:addr`
  instead of showing "not available here"
- Live page's block waypoints now link to `/block/:number` for real
  (previously a dead link since block pages lived in the other app)
- Merged both `styles.css` files — same design tokens, so nothing visually
  changed, just consolidated
- One `.env` instead of two — `VITE_API_URL` and `VITE_WS_URL` together
