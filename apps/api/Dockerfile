# syntax=docker/dockerfile:1.7
# Multi-stage build for the NestJS API inside an npm workspaces monorepo.
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

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ─── 2. Build packages + api ──────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build:packages
RUN npm run build:api

# ─── 3. Runtime ───────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

# Copy whole tree — workspace symlinks need both apps/api/dist and packages/*/dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=nestjs:nodejs /app/packages/ai/package.json ./packages/ai/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/ai/dist ./packages/ai/dist

USER nestjs
EXPOSE 4000

CMD ["node", "apps/api/dist/main.js"]
