import { z } from "zod";

const apiBaseSchema = z.url().refine(
  (value) => {
    const pathname = new URL(value).pathname;
    return pathname === "/" || pathname === "";
  },
  {
    message:
      "VITE_API_BASE must be an origin without a path (for example, https://api.superimpress.com)",
  }
);

export const clientEnvSchema = {
  VITE_API_BASE: apiBaseSchema,
  VITE_APP_URL: z.url(),
} as const;
