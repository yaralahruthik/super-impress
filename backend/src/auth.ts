import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { Elysia } from "elysia";
import { db } from "./db";
import * as schema from "./db/schema";
import { sendResetPassword } from "./emails/reset-password";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const auth = betterAuth({
  basePath: "/auth",
  trustedOrigins: [FRONTEND_URL, "https://www.linkedin.com"],
  socialProviders: {
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      // Minimal scopes (openid/profile/email) are included by default.
      // Request posting scopes via `/api/auth/link-social` (scopes param).
      redirectURI: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/callback/linkedin`,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      allowUnlinkingAll: true,
    },
  },
  plugins: [openAPI()],
});

// biome-ignore-start lint/suspicious/noExplicitAny: openapi schema extraction
// OpenAPI schema extraction for @elysiajs/openapi integration
let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
// biome-ignore lint: https://elysiajs.com/integrations/better-auth.html#openapi
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

export const OpenAPI = {
  getPaths: (prefix = "/api/auth") =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);
      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path];
        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];
          operation.tags = ["Better Auth"];
        }
      }
      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;
// biome-ignore-end lint/suspicious/noExplicitAny: openapi schema extraction

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount("/auth", auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) {
          return status(401);
        }
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
