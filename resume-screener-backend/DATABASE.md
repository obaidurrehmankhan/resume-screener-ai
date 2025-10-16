# Database Setup

## Local Development

1. Start the PostgreSQL container:
```bash
docker compose up -d
```

2. Connection String:
```
postgresql://appuser:apppass@localhost:5433/appdb
```

Or using environment variables:
```
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=appuser
DB_PASSWORD=apppass
DB_NAME=appdb
```

## Migrations

Generate a new migration:
```bash
npm run typeorm:gen MyMigrationName
```

Run migrations:
```bash
npm run typeorm:migrate
```

## Health Check

Check database status:
```bash
curl http://localhost:3000/healthz
```

Expected response when database is up:
```json
{
  "ok": true,
  "db": "up"
}