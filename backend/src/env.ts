import { Value } from "@sinclair/typebox/value";
import "dotenv/config";
import { type Static, t } from "elysia";

const envSchema = t.Object({
  DATABASE_URL: t.String({ minLength: 1 }),
  BETTER_AUTH_SECRET: t.String({ minLength: 1 }),
  BETTER_AUTH_URL: t.String({ minLength: 1 }),
  LINKEDIN_CLIENT_ID: t.String({ minLength: 1 }),
  LINKEDIN_CLIENT_SECRET: t.String({ minLength: 1 }),
  FRONTEND_URL: t.String({ minLength: 1 }),
  PORT: t.Number({ minimum: 1, maximum: 65_535, multipleOf: 1 }),
  RESEND_API_KEY: t.Optional(t.String({ minLength: 1 })),
  RESEND_FROM_EMAIL: t.Optional(t.String({ minLength: 1 })),
});

const runtimeEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  PORT: Number(process.env.PORT ?? "3000"),
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
};

const schemaErrors = [...Value.Errors(envSchema, runtimeEnv)];
if (schemaErrors.length > 0) {
  const details = schemaErrors
    .map((error) => {
      const path =
        (error.path.startsWith("/") ? error.path.slice(1) : error.path) ||
        "root";
      return `${path}: ${error.message}`;
    })
    .join("\n");

  throw new Error(`Invalid environment variables:\n${details}`);
}

const validatedEnv = runtimeEnv as Static<typeof envSchema>;

function assertValidUrl(
  key: "DATABASE_URL" | "BETTER_AUTH_URL" | "FRONTEND_URL",
  value: string
) {
  try {
    new URL(value);
  } catch {
    throw new Error(`Invalid environment variable ${key}: must be a valid URL`);
  }
}

assertValidUrl("DATABASE_URL", validatedEnv.DATABASE_URL);
assertValidUrl("BETTER_AUTH_URL", validatedEnv.BETTER_AUTH_URL);
assertValidUrl("FRONTEND_URL", validatedEnv.FRONTEND_URL);

export const env = {
  DATABASE_URL: validatedEnv.DATABASE_URL,
  BETTER_AUTH_SECRET: validatedEnv.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: validatedEnv.BETTER_AUTH_URL,
  LINKEDIN_CLIENT_ID: validatedEnv.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: validatedEnv.LINKEDIN_CLIENT_SECRET,
  FRONTEND_URL: validatedEnv.FRONTEND_URL,
  PORT: validatedEnv.PORT,
  RESEND_API_KEY: validatedEnv.RESEND_API_KEY,
  RESEND_FROM_EMAIL: validatedEnv.RESEND_FROM_EMAIL,
} as const;
