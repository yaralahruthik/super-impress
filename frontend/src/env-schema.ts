import { z } from "zod";

export const clientEnvSchema = {
  VITE_API_BASE: z.url(),
  VITE_APP_URL: z.url(),
} as const;
