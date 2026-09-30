# Inventory Management System

<p align="center">
  <strong>Full-stack inventory and stock-movement application built with React, TypeScript, Node.js, PostgreSQL and Docker.</strong>
</p>

<p align="center">
  <a href="https://github.com/eyildirim82/stok/actions/workflows/backend-integration.yml"><img src="https://github.com/eyildirim82/stok/actions/workflows/backend-integration.yml/badge.svg" alt="Backend Integration" /></a>
  <a href="https://github.com/eyildirim82/stok/actions/workflows/ui-build.yml"><img src="https://github.com/eyildirim82/stok/actions/workflows/ui-build.yml/badge.svg" alt="UI Build" /></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

A full-stack inventory application for maintaining a product catalog, recording stock entries and exits, reviewing movement history, and importing stock movements from CSV/XLSX files through a web interface and REST API.

The project focuses on engineering concerns that appear beyond basic CRUD: **transaction-safe stock updates, concurrent stock-out protection, decimal money storage, all-or-nothing bulk imports, duplicate-import protection, authentication, database migrations, integration testing and reproducible containerized deployment**.

## Engineering highlights

| Area | What the project demonstrates |
| --- | --- |
| **Full-stack architecture** | React + TypeScript frontend, Express REST API, Prisma ORM and PostgreSQL |
| **Inventory consistency** | Product quantity and movement history are updated together inside database transactions |
| **Concurrent stock-out safety** | Conditional database updates prevent simultaneous requests from overspending the same available stock |
| **Money handling** | Purchase and list prices use PostgreSQL `Decimal(12,2)` instead of binary floating-point storage |
| **Bulk import** | Authenticated CSV/XLSX imports validate every row before applying an all-or-nothing stock transaction |
| **Duplicate protection** | Successful import batches are fingerprinted with SHA-256 so an identical file cannot silently create duplicate movements |
| **API design** | Authenticated product and stock-movement endpoints with validation, status codes, filtering and pagination |
| **Verification** | Backend integration tests run against disposable PostgreSQL; frontend CI performs TypeScript type checking and production builds |
| **Deployment** | Docker Compose services, Nginx reverse proxy, Makefile commands and database backup/restore helpers |

## Core workflows

### Product management

Products are stored with a unique product code, category, purchase price, list price and current quantity.

The application provides web and API flows for creating, listing, updating and deleting product metadata. Stock quantity is intentionally **not editable from the product form**: new products start at zero stock and quantity changes are recorded through stock movements.

### Stock entry and exit

Every quantity change is represented as a `StockMovement` with:

- product
- movement type (`GIRIS` / `CIKIS`)
- quantity
- optional invoice/document number
- movement date

The backend updates the product quantity and creates the corresponding movement inside the same Prisma transaction.

For stock exits, the quantity update is conditional on sufficient stock still being available. This avoids a read-then-write race where concurrent requests could otherwise consume the same stock twice.

### Transactional CSV/XLSX import

The bulk-import endpoint accepts `.csv` and `.xlsx` files. Each row represents a normal stock movement rather than directly overwriting a product quantity.

Required columns:

```text
urunKodu,hareketTipi,miktar
```

Optional columns:

```text
faturaNo,hareketTarihi
```

Example:

```csv
urunKodu,hareketTipi,miktar,faturaNo,hareketTarihi
ABC001,GIRIS,10,FTR-1001,2026-09-30T10:30:00Z
DEF002,CIKIS,2,FTR-1002,2026-09-30T10:35:00Z
```

Import behavior:

- every row is parsed and validated before stock mutation begins;
- referenced product codes must already exist;
- quantities must be positive integers;
- a `CIKIS` row cannot consume more stock than is available;
- the complete file is committed as one transaction;
- if any row fails, earlier rows are rolled back;
- successful imports create a `StockImport` batch record;
- exact re-uploads are rejected using the file's SHA-256 digest;
- the API returns processed/error counts and row-level validation feedback.

The current upload limits are 5 MB and 1000 movement rows per file.

### Movement history

The stock-movement API supports:

- pagination
- product filtering
- movement-type filtering
- date-range filtering
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
Node.js 22 + Express 5 REST API
  │
  ▼
Prisma 6 ORM
  │
  ▼
PostgreSQL
```

The repository keeps the UI and API as separate applications while Docker Compose provides the complete local stack.

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
├── movementDate
├── importId? → StockImport
└── importRow?

StockImport
├── id
├── sha256 (unique)
├── fileName
├── rowCount
└── createdAt
```

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite 6
- React Router 7
- Tailwind CSS 4
- Axios
- Recharts

### Backend

- Node.js 22+
- Express 5
- Prisma 6
- JWT authentication
- bcryptjs
- ExcelJS
- Multer

### Infrastructure

- PostgreSQL 15 in local Docker Compose
- PostgreSQL 16 in CI integration tests
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
GET  /api/auth/me
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
POST /api/stock-movements/upload-entry
```

Example history query:

```text
GET /api/stock-movements?page=1&limit=20&movementType=CIKIS&search=ABC
```

## Verification and CI

### Backend integration

Backend integration tests run against a clean PostgreSQL 16 service in GitHub Actions. CI:

1. installs exact npm dependencies with `npm ci`;
2. generates the Prisma client;
3. applies committed migrations with `prisma migrate deploy`;
4. executes the integration test suite.

Coverage includes representative scenarios for:

- manual stock entry/exit;
- concurrent stock-out protection;
- direct stock-mutation rejection;
- decimal money persistence;
- CSV and XLSX import success;
- duplicate import rejection;
- row validation failures;
- all-or-nothing rollback on insufficient stock.

```bash
cd envanter_api
npm ci
npm test
```

### Frontend

Relevant UI pull requests run both static type checking and a production Vite build:

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
│   ├── middleware/           # Authentication and upload middleware
│   ├── prisma/               # Schema and committed migrations
│   ├── routes/               # Express routes
│   ├── services/             # Import parsing and supporting services
│   ├── test/integration/     # PostgreSQL-backed integration tests
│   └── index.js              # API entry point
├── envanter_ui/
│   ├── src/components/
│   ├── src/contexts/
│   ├── src/pages/            # Dashboard, products, stock flows and bulk import
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

Or start the Compose stack directly:

```bash
docker compose up -d
```

Apply database migrations:

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

## Implementation notes

- The dashboard summary/chart helpers aggregate existing API data on the frontend rather than using a dedicated dashboard backend endpoint.
- Bulk import is intentionally modeled as movement ingestion, not as a spreadsheet-driven direct overwrite of `Product.mevcutMiktar`.
- This repository is a technical project/demo; the README describes implemented behavior and verification boundaries rather than claiming production deployment.
