FROM oven/bun:1.0-alpine

WORKDIR /home/bun/app

USER bun

COPY public ./public

COPY .next/standalone ./
COPY .next/static ./.next/static

CMD ["bun", "server.js"]
