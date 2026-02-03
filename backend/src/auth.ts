import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, openAPI } from "better-auth/plugins";
import { Elysia } from "elysia";
import { db } from "./db";
import * as schema from "./db/schema";

export const auth = betterAuth({
  basePath: "/auth",
  trustedOrigins: ["http://localhost:5173", "https://www.linkedin.com"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["linkedin"],
    },
  },
  plugins: [
    openAPI(),
    genericOAuth({
      config: [
        {
          providerId: "linkedin",
          redirectURI:
            "http://localhost:3000/api/auth/oauth2/callback/linkedin",
          clientId: process.env.LINKEDIN_CLIENT_ID!,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
          authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
          tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
          userInfoUrl: "https://api.linkedin.com/v2/userinfo",
          scopes: ["openid", "profile", "email", "w_member_social"],
        },
      ],
    }),
  ],
});

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

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount("/auth", auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
