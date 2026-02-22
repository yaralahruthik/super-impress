import { env } from "@/env";

const API_BASE = env.VITE_API_BASE;

export const URLS = {
  authBase: `${API_BASE}/auth`,
  app: env.VITE_APP_URL,
} as const;

export const LINKEDIN = {
  brandColor: "#0A66C2",
  feedBaseUrl: "https://www.linkedin.com/feed/update/",
} as const;

export const STATUS_STYLES = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  published: "bg-green-100 text-green-800 border-green-200",
} as const;
