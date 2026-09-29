# Inventory Management System

A full-stack inventory management application for managing products, stock movements and day-to-day inventory workflows through a web interface and REST API.

Built with **React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Docker and Nginx**.

## Highlights

- Product and inventory management
- IN / OUT stock movement workflows
- JWT-based authentication
- REST API for inventory operations
- PostgreSQL data layer with Prisma ORM
- React + TypeScript frontend
- Containerized local deployment with Docker Compose
- Nginx reverse proxy
- Database backup and restore commands

## Architecture

```text
Browser
  │
  ▼
React + TypeScript UI
  │
  ▼
Nginx
  │
  ▼
Node.js / Express API
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL
```

## Project Structure

```text
├── envanter_api/          # Node.js / Express backend
│   ├── prisma/            # Database schema and migrations
│   ├── index.js           # Application entry point
│   └── Dockerfile
├── envanter_ui/           # React + TypeScript frontend
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── Makefile
```

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router

### Backend
- Node.js
- Express
- Prisma ORM
- JWT authentication

### Infrastructure
- PostgreSQL
- Docker / Docker Compose
- Nginx

## Data Model

The core domain currently includes:

- **User** — application users and authentication
- **Product** — inventory items
- **StockMovement** — stock entries, exits and movement history

## API Overview

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`

### Products
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Stock Movements
- `GET /api/stock-movements`
- `POST /api/stock-movements/manual`
- `POST /api/stock-movements/upload-entry`

## Running Locally

### Requirements

- Docker and Docker Compose
- Make (optional)

### Start the application

```bash
git clone <repository-url>
cd envanter-yonetim-sistemi
make up
```

Or:

```bash
docker-compose up -d
```

Run database migrations:

```bash
make migrate
```

### Local services

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- Nginx: `http://localhost:80`
- PostgreSQL: `localhost:5432`

## Development

```bash
make db-only       # Start only PostgreSQL
make dev           # Start development environment
make logs          # View service logs
make status        # Check services
make backup-db     # Back up the database
```

Backend development:

```bash
cd envanter_api
npm run dev
```

Frontend development:

```bash
cd envanter_ui
npm run dev
```

## Configuration

Example API environment variables:

```env
DATABASE_URL=postgresql://postgres:password@db:5432/envanter_db?schema=public
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
PORT=3001
```

Example UI environment variables:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Envanter Yönetim Sistemi
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## About

This project demonstrates end-to-end full-stack development across UI, API design, authentication, relational data modeling and containerized deployment.
