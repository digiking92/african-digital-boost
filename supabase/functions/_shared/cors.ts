const ALLOWED_ORIGINS = new Set([
  "https://auditme.learnwithchris.app",
  "https://african-digital-boost.vercel.app",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

const CORS_BASE = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

/** Reflect only trusted site origins — blocks random sites from calling APIs in browsers. */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  if (origin && isAllowedOrigin(origin)) {
    return { ...CORS_BASE, "Access-Control-Allow-Origin": origin };
  }
  return { ...CORS_BASE };
}
