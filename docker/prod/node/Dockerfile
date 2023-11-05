FROM oven/bun:1.0-alpine

WORKDIR /home/bun/app

USER bun

COPY public ./public

COPY build ./build

CMD ["/bin/sh", "-c", "HOST=0.0.0.0 bun run start"]
