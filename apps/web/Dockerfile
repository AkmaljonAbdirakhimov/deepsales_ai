# syntax=docker/dockerfile:1.7
# Multi-stage build for the Next.js app inside an npm workspaces monorepo.
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

# ─── 2. Build packages + web ──────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time vars so `next build` and Better Auth client init don't fail.
# Real secrets are injected at container runtime, never baked into the image.
ENV BETTER_AUTH_SECRET="build-time-placeholder-build-time-placeholder"
ENV BETTER_AUTH_URL="http://localhost:3000"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENV NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

RUN npm run build:packages
RUN npm run build:web

# ─── 3. Runtime — minimal image with just the standalone output ───────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
