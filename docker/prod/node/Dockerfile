FROM oven/bun:1.0-alpine AS builder

WORKDIR /home/bun/app

COPY package.json bun.lockb ./

RUN bun install --production

FROM oven/bun:1.0-alpine

WORKDIR /home/bun/app

COPY --from=node:20-alpine /usr/lib /usr/lib
COPY --from=node:20-alpine /usr/local/share /usr/local/share
COPY --from=node:20-alpine /usr/local/lib /usr/local/lib
COPY --from=node:20-alpine /usr/local/include /usr/local/include
COPY --from=node:20-alpine /usr/local/bin /usr/local/bin

COPY public build server.js package.json ./

COPY --from=builder /home/bun/app/node_modules ./node_modules

USER bun

CMD ["/bin/sh", "-c", "HOST=0.0.0.0 bun run start"]
