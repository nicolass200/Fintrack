function normalizeApiUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL || "http://localhost:3333"
);
