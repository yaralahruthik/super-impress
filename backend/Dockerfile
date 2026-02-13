FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    src/index.ts

FROM oven/bun:1-alpine

WORKDIR /app

COPY --from=build /app/server server

USER bun

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]
