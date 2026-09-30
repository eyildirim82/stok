# Inventory Management System

<p align="center">
  <strong>Full-stack inventory and stock movement application built with React, TypeScript, Node.js, PostgreSQL and Docker.</strong>
</p>

<p align="center">
  <a href="https://github.com/eyildirim82/stok/actions/workflows/backend-integration.yml"><img src="https://github.com/eyildirim82/stok/actions/workflows/backend-integration.yml/badge.svg" alt="Backend Integration" /></a>
  <a href="https://github.com/eyildirim82/stok/actions/workflows/ui-build.yml"><img src="https://github.com/eyildirim82/stok/actions/workflows/ui-build.yml/badge.svg" alt="UI Build" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
</p>

A full-stack inventory management system for maintaining a product catalog, recording stock entries and exits, reviewing movement history and operating day-to-day inventory workflows through a web interface and REST API.

The project focuses on the parts of inventory software that become important beyond basic CRUD: **transactional stock updates, concurrent stock-out safety, exact money storage, filtering/pagination, authentication, database migrations, integration testing and reproducible containerized deployment**.

## Engineering highlights

| Area | What the project demonstrates |
| --- | --- |
| **Full-stack architecture** | React + TypeScript frontend, Express REST API, Prisma ORM and PostgreSQL |
| **Inventory consistency** | Stock movement records and product quantities are updated inside one database transaction |
| **Concurrent stock-out safety** | Conditional database updates prevent simultaneous stock-out requests from consuming the same available quantity twice |
| **Money handling** | Purchase and list prices use PostgreSQL `Decimal(12,2)` rather than floating-point storage |
| **API design** | Authenticated product and stock-movement endpoints with validation, status codes, filtering and pagination |
| **Frontend workflows** | Dashboard, product management, stock entry, stock exit, movement history and bulk-upload UI |
| **Verification** | Backend integration tests run against disposable PostgreSQL; frontend CI performs TypeScript type checking and production builds |
| **Deployment** | Docker Compose services, Nginx reverse proxy, Makefile commands and database backup/restore helpers |

## Core workflows

### Product management

Products are stored with a unique product code, category, purchase price, list price and current quantity. The application provides web and API flows for creating, listing, updating and deleting inventory records.

### Stock entry and exit

Stock changes are represented as immutable movement records with:

- product
- movement type (`GIRIS` / `CIKIS`)
- quantity
- optional invoice number
- movement date

The backend updates the product quantity and creates the corresponding movement inside the same Prisma transaction.

For stock exits, the update is conditional on the product still having enough quantity. This avoids a read-then-write race where concurrent requests could otherwise oversell the same stock.

### Movement history

The stock-movement API supports:

- pagination
- product filtering
- movement-type filtering
- date range filtering
- product-code/category search
- configurable ordering

Page size is capped server-side to keep list requests bounded.

## Architecture

```text
Browser
  │
  ▼
React 19 + TypeScript + Vite
  │
  ▼
Nginx reverse proxy
  │
  ▼
Node.js + Express REST API
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL
```

The repository separates the UI and API into independent applications while Docker Compose provides the complete local stack.

## Data model

```text
User
├── id
├── username (unique)
└── password

Product
├── id
├── urunKodu (unique)
├── kategori
├── alisFiyati     Decimal(12,2)
├── listeFiyati    Decimal(12,2)
├── mevcutMiktar
└── stockMovements[]

StockMovement
├── id
├── productId → Product
├── movementType
├── quantity
├── faturaNo?
└── movementDate
```

## Tech stack

**Frontend**

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Recharts

**Backend**

- Node.js 22
- Express 5
- Prisma 6
- JWT authentication
- bcryptjs

**Infrastructure**

- PostgreSQL 16
- Docker / Docker Compose
- Nginx
- GitHub Actions
- Make

## REST API overview

### Authentication

```text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### Products

```text
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### Stock movements

```text
GET  /api/stock-movements
POST /api/stock-movements/manual
```

Example history query:

```text
GET /api/stock-movements?page=1&limit=20&movementType=CIKIS&search=ABC
```

## Verification and CI

### Backend

Backend integration tests run against a clean PostgreSQL 16 service in GitHub Actions. CI:

1. installs exact npm dependencies
2. generates the Prisma client
3. applies committed migrations with `prisma migrate deploy`
4. executes the integration test suite

The current integration suite covers stock-movement behavior and decimal money handling.

```bash
cd envanter_api
npm ci
npm test
```

### Frontend

Every relevant UI pull request runs both static type checking and a production Vite build:

```bash
cd envanter_ui
npm ci
npm run typecheck
npm run build
```

## Project structure

```text
├── envanter_api/
│   ├── controllers/          # API application logic
│   ├── middleware/           # Authentication middleware
│   ├── prisma/               # Schema and committed migrations
│   ├── routes/               # Express routes
│   ├── test/integration/     # PostgreSQL-backed integration tests
│   └── index.js              # API entry point
├── envanter_ui/
│   ├── src/components/
│   ├── src/contexts/
│   ├── src/pages/            # Dashboard, products, stock flows, history
│   ├── src/services/         # API client
│   └── src/utils/
├── .github/workflows/        # Backend and frontend verification
├── docker-compose.yml
├── nginx.conf
├── Makefile
└── SETUP.md
```

## Running locally

### Requirements

- Docker
- Docker Compose
- Make (optional)

```bash
git clone https://github.com/eyildirim82/stok.git
cd stok
cp .env.example .env
make up
```

Or run the Compose stack directly:

```bash
docker compose up -d
```

Apply migrations:

```bash
make migrate
```

### Local services

| Service | Address |
| --- | --- |
| Nginx / application | `http://localhost` |
| Frontend | `http://localhost:3000` |
| API | `http://localhost:3001` |
| PostgreSQL | `localhost:5432` |

Useful commands:

```bash
make db-only
make dev
make logs
make status
make backup-db
```

See [SETUP.md](SETUP.md) for additional setup details.

## Configuration

Example backend environment variables:

```env
DATABASE_URL=postgresql://postgres:password@db:5432/envanter_db?schema=public
JWT_SECRET=replace-with-a-strong-secret
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3001
```

Example frontend variables:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Envanter Yönetim Sistemi
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## Current development notes

The core product CRUD, authenticated stock-movement API and transaction-safe stock entry/exit flows are implemented.

Two UI areas are intentionally not presented here as completed backend features:

- the dashboard summary/chart service is currently frontend-side rather than a dedicated `/api/dashboard` backend endpoint;
- the bulk Excel/CSV upload screen exists in the UI, but the current backend route set does not yet expose an upload endpoint.

Keeping these boundaries explicit is intentional: the repository should describe what the current code actually does rather than presenting unfinished surfaces as completed features.
