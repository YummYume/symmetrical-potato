FROM oven/bun:1.0-alpine AS builder

WORKDIR /home/bun/app

COPY package.json bun.lockb ./

RUN bun install --production

FROM oven/bun:1.0-alpine

WORKDIR /home/bun/app

USER bun

COPY public ./public

COPY build ./build

COPY server.js ./server.js

COPY --from=builder /home/bun/app/node_modules ./node_modules

CMD ["/bin/sh", "-c", "HOST=0.0.0.0 bun run start"]
