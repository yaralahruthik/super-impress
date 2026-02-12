import { createEnv } from "@t3-oss/env-core";
import { clientEnvSchema } from "./env-schema";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: clientEnvSchema,
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
