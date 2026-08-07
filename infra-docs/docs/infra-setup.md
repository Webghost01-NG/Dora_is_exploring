# Infra

One shared Postgres instance for the whole team — everyone points their `indexer/.env`
and `server/.env` at the same DB so you're not each debugging your own local copy.

## Start Postgres

```bash
cd infra
docker-compose up -d
```

Confirm it's running:
```bash
docker ps
```
You should see `dora-explorer-db` listed and healthy.

## Stop it

```bash
docker-compose down
```
Add `-v` if you also want to wipe the data volume and start clean:
```bash
docker-compose down -v
```

## Connection details

Matches `infra/.env.example` — copy the relevant values into `indexer/.env` and `server/.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=explorer
DB_USER=postgres
DB_PASSWORD=postgres
```

## Troubleshooting

- **Port 5432 already in use** — you likely have a local Postgres already running. Either stop it, or change the host port in `docker-compose.yml` (e.g. `"5433:5432"`) and update `DB_PORT` accordingly.
- **Connection refused** — give it a few seconds after `docker-compose up -d`, Postgres takes a moment to initialize on first run.
