# DeepSales

AI-powered call analysis and CRM automation platform.

## Stack

| Layer | Technology |
|---|---|
| UI / Auth frontend | Next.js 15 (App Router + Tailwind) |
| API | NestJS + TypeORM |
| Auth | Better Auth (Organizations plugin) |
| Workflows | Temporal |
| Transactional DB | PostgreSQL 16 |
| Analytics DB | ClickHouse 24 |

## Monorepo layout

```
deepsales/
  apps/
    web/      Next.js — UI panels, auth endpoints
    api/      NestJS  — REST API, CRM webhooks
    worker/   Temporal workers — call processing pipeline
  packages/
    shared/   Shared TypeScript types
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```
BETTER_AUTH_SECRET=   # run: openssl rand -base64 32
```

All other defaults work for local Docker.

### 3. Start infrastructure (Postgres + ClickHouse + Temporal)

```bash
npm run infra:up
```

Services started:

| Service | URL |
|---|---|
| PostgreSQL | `localhost:5432` |
| ClickHouse HTTP | `localhost:8123` |
| Temporal gRPC | `localhost:7233` |
| Temporal UI | `http://localhost:8080` |

Wait ~10 seconds for Temporal to connect to Postgres on first run.

### 4. Run database migrations

```bash
npm run db:migrate
```

This runs the Better Auth CLI which creates all auth/org tables in Postgres:
`user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`

TypeORM auto-creates the app tables (`calls`, `tenants`) on API start in development (`synchronize: true`).

### 5. Start the apps

Open three terminals (or use a process manager):

```bash
# Terminal 1 — Next.js
npm run dev:web        # http://localhost:3000

# Terminal 2 — NestJS API
npm run dev:api        # http://localhost:4000/api/v1

# Terminal 3 — Temporal worker
npm run dev:worker
```

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run infra:up` | Start all Docker services |
| `npm run infra:down` | Stop Docker services (keep data) |
| `npm run infra:reset` | Wipe all volumes and restart fresh |
| `npm run db:migrate` | Apply Better Auth schema to Postgres |
| `npm run dev:web` | Start Next.js dev server |
| `npm run dev:api` | Start NestJS dev server |
| `npm run dev:worker` | Start Temporal worker |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint` | Lint all workspaces |

---

## CRM webhook endpoint

```
POST /api/v1/webhooks/:tenantId/:crmSource
```

Supported `crmSource` values: `amocrm`, `bitrix24`, `odoo`

This is a public endpoint (no auth). Webhook secret validation per tenant is added in `WebhooksService`.

---

## Auth

Better Auth handles all authentication. The auth handler is mounted at:

```
/api/auth/*   (Next.js — apps/web)
```

The NestJS API validates sessions via `@thallesp/nestjs-better-auth`. All API routes are protected by default. Use `@AllowAnonymous()` for public routes (e.g. webhooks).
