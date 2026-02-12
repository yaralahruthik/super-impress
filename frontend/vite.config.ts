import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { clientEnvSchema } from "./src/env-schema";

function validateBuildEnv(
  env: Record<string, string>,
  command: "build" | "serve"
) {
  if (command !== "build") {
    return;
  }

  createEnv({
    clientPrefix: "VITE_",
    client: clientEnvSchema,
    runtimeEnv: env,
    emptyStringAsUndefined: true,
  });
}

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  validateBuildEnv(env, command);

  return {
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      tailwindcss(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
