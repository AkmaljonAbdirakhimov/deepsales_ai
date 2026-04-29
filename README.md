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

If any local ports are already taken, change them in `.env` before `npm run infra:up`:

```env
DB_PORT=55432
CH_HTTP_PORT=18123
CH_TCP_PORT=19000
TEMPORAL_PORT=17233
TEMPORAL_UI_PORT=18080
TEMPORAL_ADDRESS=localhost:17233
```

### 4. Run database migrations

```bash
npm run db:migrate
```

This runs the Better Auth CLI which creates all auth/org tables in Postgres:
`user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`

TypeORM auto-creates the app tables (`calls`, `tenants`) on API start in development (`synchronize: true`).

### 5. Bootstrap the super admin

Public sign-up is **disabled** — only the super admin (and users they create) can sign in. Set the credentials in `.env`:

```
SUPER_ADMIN_EMAIL=admin@deepsales.local
SUPER_ADMIN_PASSWORD=ChangeMe!2026
SUPER_ADMIN_NAME=Super Admin
```

Then run:

```bash
npm run setup:super-admin
```

The script is **idempotent**:
- if the user does not exist → creates it with `role="admin"`
- if the user exists but is not admin → promotes it
- if the user already exists and is admin → no changes (password is **never** overwritten)

After running it, sign in at `http://localhost:3100/login` with those credentials and you'll land on `/super-admin`.

> **Production:** change `SUPER_ADMIN_PASSWORD` from the default before running this in any non-local environment, then rotate it from the Super Admin panel after first sign-in.

### 6. Start the apps

Open three terminals (or use a process manager):

```bash
# Terminal 1 — Next.js
npm run dev:web        # http://localhost:3100

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
| `npm run setup:super-admin` | Create / promote the super admin from `.env` (idempotent) |
| `npm run dev:web` | Start Next.js dev server |
| `npm run dev:api` | Start NestJS dev server |
| `npm run dev:worker` | Start Temporal worker |
| `npm run typecheck` | Type-check all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run build:all` | Production build of web, api, worker |
| `npm run ci` | Lint + typecheck + build:all (same as GitHub Actions) |

---

## CI / GitHub Actions

On every push and pull request to `main` or `master`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs:

1. **Node** — install deps, `lint`, `typecheck`, `build:all` (with dummy env vars so Next/Better Auth can build).
2. **Docker** — `docker compose config` to validate `docker-compose.yml`.

**Lockfile:** If you commit `package-lock.json` at the repo root, CI uses `npm ci` for reproducible installs. Without it, CI falls back to `npm install` and prints a warning.

### Deploy (manual + approval)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs **only** when you choose **Actions → Deploy → Run workflow**. It does **not** run on every push.

Pipeline:

1. Build three Docker images in parallel (`web`, `api`, `worker`) using the per-app Dockerfiles.
2. Push them to **GHCR** tagged with the short SHA and `latest`.
3. Wait for approval on the **`production`** GitHub Environment.
4. SSH to the VPS, set `IMAGE_TAG` in `.env`, run `docker compose pull` + `up -d`.

**One-time GitHub setup**

1. Repo → **Settings** → **Environments** → **New environment** → name: **`production`**.
2. Enable **Required reviewers** and add yourself.
3. Add these **Repository secrets** (Settings → Secrets and variables → Actions):

   | Secret | Example | Notes |
   |---|---|---|
   | `VPS_HOST` | `1.2.3.4` | server IP or hostname |
   | `VPS_USER` | `deploy` | SSH user on the VPS |
   | `VPS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----…` | private key contents (paired pubkey is in the VPS user's `authorized_keys`) |
   | `VPS_PROJECT_DIR` | `/opt/deepsales` | directory on the VPS that holds compose files + `.env` |
   | `VPS_SSH_PORT` | `22` | optional; defaults to 22 |

   `GITHUB_TOKEN` is provided automatically and is used to push to GHCR.

**One-time VPS setup**

```bash
# On the VPS, as the SSH user:
mkdir -p /opt/deepsales && cd /opt/deepsales

# Copy the compose files from the repo:
git clone https://github.com/<your-org>/deepsales.git .
# (or scp just docker-compose.yml + docker-compose.prod.yml + .env.example)

cp .env.example .env
# Edit .env and set real values for:
#   BETTER_AUTH_SECRET, BETTER_AUTH_URL, WEB_URL,
#   DB_PASSWORD, GEMINI_API_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL
```

After the first successful deploy, the VPS's `.env` will also contain `IMAGE_TAG` and `GITHUB_REPOSITORY` written by the workflow.

**Manual deploy from the VPS** (if you ever need to skip the workflow):

```bash
cd /opt/deepsales
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

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

### Plugins enabled

| Plugin | Purpose |
|---|---|
| `organization` | Tenants (= companies). Roles per org: `owner`, `admin`, `member`. Invitations + member management. |
| `admin` | Super-admin endpoints: list users, create users, ban/unban, set role, impersonate, delete. Backs the Super Admin panel. |

### Security & observability

Configured directly on the `auth` instance:

- **Rate limiting** is on, persisted to a `rateLimit` table in Postgres. Defaults: 100 req / 60s globally, with stricter rules for `/sign-in/email`, `/sign-up/email`, `/request-password-reset`.
- **Real client IP** is read from `cf-connecting-ip`, `x-forwarded-for`, `x-real-ip` so rate limits aren't applied to your reverse proxy.
- **IPv6 /64 subnet rate limiting** prevents bypass via address rotation.

### Role-based panels

The web app has three separate panels. After sign-in, users land on `/dashboard` which redirects to the right one based on their role:

| Who | Panel | Route |
|---|---|---|
| Platform admin (`user.role === "admin"`) | Super Admin | `/super-admin` |
| Org `owner` or `admin` | Company | `/company` |
| Org `member` | Manager | `/manager` |
| Authenticated, no org yet | Onboarding | `/onboarding` |

Each panel has its own layout, sidebar, and server-side guard that re-checks the role on every request. Edge `middleware.ts` only checks for the presence of a session cookie; layouts do the role-specific routing.

### Super Admin panel

URL: `/super-admin` (redirects to `/super-admin/users`).

Pages:

- **Users** — list, search, ban/unban, impersonate, delete, view role and status.
- **Organizations** — list all tenants with member counts.

Access requires `user.role === "admin"` in the database **or** the user ID being listed in `BETTER_AUTH_ADMIN_USER_IDS`.

### Company panel

URL: `/company`. Visible to org owners and admins.

Pages:

- **Overview** — high-level KPIs across the company.
- **Calls** — all calls processed for the company.
- **Team** — invite members, change roles, remove members, cancel pending invitations.
- **Integrations** — CRM/telephony connections (placeholder).
- **Settings** — company name, slug, billing.

### Manager panel

URL: `/manager`. Visible to org members (sales managers).

Pages:

- **My calls** — personal call list and personal performance KPIs only.

**Bootstrapping the first super-admin**

Public sign-up is disabled. The super admin is created from `.env` by running:

```bash
npm run setup:super-admin
```

Required env vars:

```
SUPER_ADMIN_EMAIL=admin@deepsales.local
SUPER_ADMIN_PASSWORD=ChangeMe!2026
SUPER_ADMIN_NAME=Super Admin
```

The script is idempotent — re-running it will only create-or-promote, it will never overwrite an existing password. To rotate the password, sign in and change it from the Super Admin panel (or run a manual SQL update).

If you ever need to grant additional super admins without putting them in the DB, you can add their user IDs to `BETTER_AUTH_ADMIN_USER_IDS` (comma-separated) — the admin plugin treats those IDs as admin without needing the `role` column set.
