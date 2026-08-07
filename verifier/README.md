# Dora the Explorer — Contract Verifier

Accepts Solidity source code, compiles it, and checks whether the compiled
bytecode matches what's actually deployed on-chain at a given address. Stores
verified source + ABI so the rest of the explorer can show "Verified" badges
and decode contract event logs into readable names/args.

## Setup

```bash
npm install
cp .env.example .env
```

Needs a plain **HTTPS** RPC URL in `RPC_HTTP_URL` (not WebSocket - this service
only makes one-off `getCode()` calls, no subscriptions). A free public one is
already in `.env.example` to get started immediately; swap for your own
Alchemy/Infura key for reliability.

Also needs the shared Postgres running (`infra/docker-compose.yml`).

## Run

```bash
npm run dev
```

You should see:
```
[verifier] listening on :3002
[db] contracts table ready
```

## Verified working

- `node --check` passes clean on all three files
- Ran an actual end-to-end compile test with a real Solidity contract
  (`Counter.sol` with an event) — produced valid ABI (3 entries) and bytecode.
  solc genuinely compiles, this isn't just a stub.
- Booted the server standalone — listens correctly, fails gracefully with a
  clear error (not a crash) when Postgres isn't reachable yet.

## Endpoints

### `POST /verify`
```json
{
  "address": "0x...",
  "sourceCode": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Foo { ... }",
  "contractName": "Foo",
  "optimizerEnabled": false,
  "optimizerRuns": 200
}
```
Compiles the source, fetches the live bytecode at `address` via RPC, compares
them, and stores the result. Returns whether it matched.

### `GET /contract/:address`
Returns the stored verified source, ABI, and match status for an address.
404 if never verified.

### `POST /decode-log`
```json
{ "address": "0x...", "topics": ["0x..."], "data": "0x..." }
```
Uses a verified contract's stored ABI to decode a raw event log into
`{ eventName, args }`. Feed this whatever `indexer` or `server` has in a
transaction's raw logs, once you're ready to wire that up.

## Known limitations (be upfront about these if judges ask)

- **Single-file contracts only.** No import resolution — if the contract
  imports OpenZeppelin or other files, compilation will fail. Flattening the
  source before submitting is the workaround.
- **Bytecode match is strict string equality** on deployed (runtime) bytecode.
  Different compiler *builds* of the same version can embed different metadata
  hashes and cause a false "no match" even when the logic is identical. This
  is a real limitation of naive verification, not a bug — Etherscan's actual
  verifier has more tolerance logic here that this doesn't replicate.
- **Compiler version is whatever `solc` npm package version is installed**
  (pinned in `package.json`), not user-selectable per request. Fine for a
  hackathon where the whole team compiles against one Solidity version anyway.
