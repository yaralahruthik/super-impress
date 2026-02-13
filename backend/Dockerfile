# base stage
FROM oven/bun:1-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]

# build stage
FROM base AS build
COPY . .
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    src/index.ts

# production stage
FROM oven/bun:1-alpine AS production
WORKDIR /app

COPY --from=build /app/server server

USER bun

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]
