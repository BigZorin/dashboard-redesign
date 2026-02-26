FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app

# NEXT_PUBLIC vars must be available at build time (inlined into JS bundle)
ENV NEXT_PUBLIC_SUPABASE_URL=https://ezciexorsprdrjhntqie.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_lcQ8K-iCbvoLTUvoNve_HA_saeyI9lo

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
