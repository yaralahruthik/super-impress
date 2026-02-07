FROM oven/bun:1.2.0-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

EXPOSE 5173

CMD ["bun", "run", "preview", "--host", "0.0.0.0", "--port", "5173"]
