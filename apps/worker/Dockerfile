# syntax=docker/dockerfile:1.7
# Multi-stage build for the Temporal worker inside an npm workspaces monorepo.
# Build context = repo root.

# ─── 1. Install all workspace dependencies ────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/worker/package.json ./apps/worker/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ai/package.json ./packages/ai/

# @temporalio/worker contains native modules — needs build tools on alpine.
RUN apk add --no-cache python3 make g++ \
 && (if [ -f package-lock.json ]; then npm ci; else npm install; fi)

# ─── 2. Build packages + worker ───────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build:packages
RUN npm run build:worker

# ─── 3. Runtime ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 worker

COPY --from=builder --chown=worker:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/package.json ./package.json
COPY --from=builder --chown=worker:nodejs /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder --chown=worker:nodejs /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder --chown=worker:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=worker:nodejs /app/packages/ai/package.json ./packages/ai/package.json
COPY --from=builder --chown=worker:nodejs /app/packages/ai/dist ./packages/ai/dist

USER worker

CMD ["node", "apps/worker/dist/worker.js"]
