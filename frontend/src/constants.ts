const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const URLS = {
  authBase: `${API_BASE}/api/auth`,
  app: import.meta.env.VITE_APP_URL || "http://localhost:5173",
} as const;

export const LINKEDIN = {
  brandColor: "#0A66C2",
  feedBaseUrl: "https://www.linkedin.com/feed/update/",
} as const;

export const PASSWORD = {
  minLength: 8,
  maxLength: 15,
} as const;

export const STATUS_STYLES = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  published: "bg-green-100 text-green-800 border-green-200",
} as const;
