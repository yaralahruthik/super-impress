import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { betterAuthPlugin, OpenAPI } from "./auth";
import { env } from "./env";
import { startScheduler, stopScheduler } from "./jobs/scheduler";
import { publishWorker } from "./jobs/worker";
import { linkedInModule } from "./modules/linkedin";
import { postsModule } from "./modules/posts";

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "SuperImpress API",
          version: "1.0.0",
          description: "LinkedIn post management tool API",
        },
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
    })
  )
  .use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(betterAuthPlugin)
  .use(postsModule)
  .use(linkedInModule)
  .onError(({ error, path }) => {
    console.error(`[${path}]`, error);
  })
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

startScheduler();

process.on("SIGTERM", async () => {
  stopScheduler();
  await publishWorker.close();
  process.exit(0);
});

export type App = typeof app;
