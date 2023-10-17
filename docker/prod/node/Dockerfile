FROM oven/bun:1.0-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /home/bun/app

USER bun

# Install dependencies based on the preferred package manager
COPY package.json bun.lockb postcss.config.js next.config.js tsconfig.json tailwind.config.ts sentry.** /
# Omit --production flag for TypeScript devDependencies
RUN bun install --frozen-lockfile

COPY src ./src
COPY public ./public

# Build Next.js based on the preferred package manager
RUN bun run build

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /home/bun/app

USER bun

COPY --from=builder /home/bun/app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /home/bun/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /home/bun/app/.next/static ./.next/static


CMD ["bun", "server.js"]