import { createAuthClient } from "better-auth/react";
import { URLS } from "@/constants";

export const authClient = createAuthClient({
  baseURL: URLS.authBase,
});
