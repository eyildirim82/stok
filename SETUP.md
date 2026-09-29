# Inventory Management System — Setup

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ or Docker
- npm

## Option 1: Docker Compose

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Replace the example values in `.env` with local development values. Do not commit `.env`.

3. Start the stack:

```bash
docker compose up -d
```

The default local services are:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- API health: `http://localhost:3001/api/health`

## Option 2: Run locally

### Backend

```bash
cd envanter_api
npm install
```

Create `envanter_api/.env` using the variables documented in the repository `.env.example` and point `DATABASE_URL` at your local PostgreSQL instance.

Then run the Prisma migrations and start the API:

```bash
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd envanter_ui
npm install
npm run dev
```

## Configuration

Secrets and machine-specific values are intentionally kept out of source control. The application expects configuration through environment variables, including:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `VITE_API_URL`

Use `.env.example` as the configuration template and keep real credentials only in your local/deployment environment.

## Troubleshooting

### Database connection errors

- Confirm PostgreSQL is running.
- Confirm `DATABASE_URL` points to the correct host, port and database.
- Confirm the configured database user has access to the database.

### Port conflicts

The development configuration uses ports `3000`, `3001` and `5432`. Change the local configuration if another service already uses one of these ports.

### Frontend cannot reach the API

- Confirm the backend is running.
- Check `VITE_API_URL`.
- Check the API CORS configuration.

## Production notes

Do not use development/example credentials in production. Inject production secrets through the hosting platform or secret-management system rather than committing them to the repository.
