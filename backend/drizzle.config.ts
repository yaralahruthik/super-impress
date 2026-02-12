import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!(databaseUrl && databaseUrl.trim().length > 0)) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

try {
  new URL(databaseUrl);
} catch {
  throw new Error(
    "Invalid environment variable DATABASE_URL: must be a valid URL"
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
