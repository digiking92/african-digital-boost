const ALLOWED_LINK_PROTOCOLS = new Set(["http:", "https:"]);

/** Block javascript:, data:, and other dangerous href schemes from untrusted search data. */
export function sanitizeExternalUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_LINK_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
