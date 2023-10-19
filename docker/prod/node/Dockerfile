FROM oven/bun:1.0-alpine AS base

# # Step 1. Install dependencies
# FROM base AS deps

# WORKDIR /home/bun/app

# COPY package.json bun.lockb postcss.config.js next.config.js tsconfig.json tailwind.config.ts sentry.** ./

# RUN bun install --frozen-lockfile

# # Step 2. Rebuild the source code only when needed
# FROM base AS builder

# WORKDIR /home/bun/app

# COPY --from=deps /home/bun/app/ ./

# COPY .env ./
# COPY src ./src
# COPY public ./public

# RUN bun run build

# Step 3. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /home/bun/app

USER bun

COPY public ./public

# Automatically leverage output traces to reduce image size
COPY .next/standalone ./
COPY .next/static ./.next/static

CMD ["bun", "server.js"]