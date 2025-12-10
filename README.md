# Intelligent Queue & Token Management System

**Full‑stack, production‑ready queue & token management system** — realtime web app with customer token generation, operator/admin dashboard, kiosk display, persistent history (Postgres), in‑memory active queue (Redis), and realtime updates (Socket.IO).

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture Overview](#architecture-overview)
5. [Getting Started (Local Development)](#getting-started-local-development)
   * Prerequisites
   * Quick start (docker-compose)
6. [Environment Variables](#environment-variables)
7. [Database & Seeding](#database--seeding)
8. [API Endpoints (Representative)](#api-endpoints-representative)
9. [Realtime Events / WebSocket Namespace](#realtime-events--websocket-namespace)
10. [Testing & CI](#testing--ci)
11. [Deployment](#deployment)
12. [Security & Operational Notes](#security--operational-notes)
13. [Developer Checklist (Sprints)](#developer-checklist-sprints)
14. [Demo & Acceptance Criteria](#demo--acceptance-criteria)
15. [Extras / Optional Enhancements](#extras--optional-enhancements)

---

## Project Summary

A web application for managing customer queues and tokens in service environments (banks, government counters, clinics). Customers can generate same‑day tokens; operators call/serve/skip tokens from an admin dashboard; kiosks display "Now Serving" in real time. The system uses PostgreSQL for persistent history, Redis for active queue state and concurrency control, and Socket.IO for low‑latency UI updates.

## Tech Stack

* **Frontend:** React (or Next.js) + TypeScript, Tailwind CSS
* **Backend:** Node.js + TypeScript (Express.js or NestJS)
* **Database:** PostgreSQL
* **In‑memory store:** Redis
* **Realtime:** Socket.IO (WebSocket fallback)
* **Containerization:** Docker + docker-compose
* **Reverse proxy:** Nginx (for static files + WebSocket proxy)
* **Testing:** Jest, Supertest, React Testing Library
* **CI:** GitHub Actions

## Features

* **Customer token generation** with ETA & QR receipt
* **Role‑based Admin & Operator dashboard**
* **Kiosk full‑screen Now Serving display**
* **Real‑time updates (Socket.IO)** for all client types
* **Redis‑based queue state** with atomic operations / locks
* **Token history audit** in PostgreSQL
* **OpenAPI (Swagger)** documentation
* **Dockerized** local and production configurations

## Architecture Overview

* **Backend** exposes REST API + WebSocket namespace `/ws/queues`.
* **PostgreSQL** stores users, services, tokens, counters, audit logs.
* **Redis** stores active queues (per counter/service) and short‑lived locks using SETNX or Lua scripts to ensure atomic pop+assign.
* **Frontend** uses React + Socket.IO client to subscribe to rooms (`counter:<id>`, `service:<id>`, `global`).

---

## Getting Started (Local Development)

### Prerequisites

* Docker & docker‑compose
* Node.js (16+) and Yarn / npm (for local frontend/backend dev)

### Quick start (docker-compose)

1. Copy `.env.example` to `.env` and fill required values.
2. Run:

```bash
docker-compose up --build
```

3. Open:

* **Frontend:** `http://localhost:3000`
* **Swagger/OpenAPI:** `http://localhost:4000/api/docs` (backend)

> The compose setup includes: `backend`, `frontend`, `postgres`, `redis`, `nginx`, and a `migrations` service.

---

## Environment Variables

Provide in `.env` (example keys):

```
# Backend
PORT=4000
DATABASE_URL=postgres://user:pass@postgres:5432/queue_db
REDIS_URL=redis://redis:6379
JWT_SECRET=change_this
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:4000
```

---

## Database & Seeding

* Migrations defined in `migrations/` (sql or migration tool like Knex/TypeORM).
* Seed script populates: services, counters, admin/operator users, and sample tokens.

**Example seed entities:**

* **Services:** Deposit, Withdrawal, Passbook
* **Counters:** Counter A (Deposit/Withdrawal), Counter B (Passbook), Counter C (All)

Run migrations + seed (inside `migrations` container or via npm script):

```bash
# Example
npm run migrate && npm run seed
```

---

## API Endpoints (Representative)

*Note: All endpoints use JWT auth. Admin/operator endpoints require proper roles.*

### Auth
* `POST /api/auth/register` — register user (admin/operator/kiosk/user)
* `POST /api/auth/login` — login → returns JWT

### Customer
* `POST /api/tokens` — create token `{ service_id, customer_info, preferred_slot? }` → `{ token_number, token_id, eta }`
* `GET /api/tokens/:id/status` — token status & queue position

### Admin / Operator
* `GET /api/counters` — list counters + queue sizes
* `POST /api/counters/:id/call` — call next token (pop from Redis + persist called state)
* `POST /api/counters/:id/serve` — mark token as serving/completed
* `POST /api/counters/:id/skip` — skip token
* `GET /api/tokens` — history + filters
* `POST /api/tokens/:id/assign` — manual assignment

### Utilities
* `GET /api/services`
* `GET /api/stats`

More details and request/response schemas are provided in the OpenAPI spec at `/api/docs`.

---

## Realtime Events / WebSocket Namespace

**Namespace:** `/ws/queues`
**Rooms:** `global`, `service:<id>`, `counter:<id>`

**Events emitted by server:**

* `token_generated` — payload: token summary
* `token_called` — payload: token_id, counter_id
* `token_served` — payload: token_id, counter_id
* `queue_update` — payload: minimal queue deltas
* `counter_status` — payload: counter metadata

Clients should implement auto‑reconnect and show stale indicator when disconnected.

---

## Testing & CI

* Run unit tests for backend:

```bash
cd backend && npm test
```

* **Integration tests** (Supertest) included for key endpoints (token generation + call/serve).
* **Frontend tests** use React Testing Library.
* **GitHub Actions workflow:** `lint` → `test` → `build`.

---

## Deployment

* `docker-compose.prod.yml` for production with environment variables configured.
* Nginx as reverse proxy (handles websocket proxying).
* Steps:
  1. Build images (`docker build` for backend & frontend)
  2. Push to registry (optional)
  3. Deploy on VPS or container orchestration (Docker Compose / Kubernetes)

---

## Security & Operational Notes

* Use HTTPS in production with TLS termination at proxy.
* Store JWT refresh tokens in secure HTTP‑only cookies; access tokens may be stored in memory.
* Use bcrypt/argon2 for password hashing.
* Rate limit token generation endpoints to prevent abuse.
* Implement Redis key expiry and monitoring; set reasonable TTLs for locks.

---

## Developer Checklist (Sprints)

1. **Repo scaffolding** (TypeScript, ESLint, Prettier, Husky).
2. **DB models + migrations**.
3. **Redis queue primitives** + Lua atomic script.
4. **Auth & RBAC**.
5. **Core REST endpoints**.
6. **Realtime events** via Socket.IO.
7. **Frontend flows** (customer, admin/operator, kiosk).
8. **Tests, CI, Dockerization**.
9. **Documentation & OpenAPI**.

---

## Demo & Acceptance Criteria

* All flows demonstrated with seed data: token creation → operator call → serve → history recorded.
* OpenAPI available at `/api/docs`.
* `docker-compose up --build` brings entire stack up and ready.

---

## Extras / Optional Enhancements

* SMS/WhatsApp token notifications
* ETA prediction using moving average or ML model
* Multi‑branch central admin
* QR token scanning and check‑in
* Offline‑first kiosk with service worker

---

## Contributing

* Fork repo → create feature branch → open PR with description and tests
* Follow commit message conventions and ensure CI passes

---

## License

MIT
