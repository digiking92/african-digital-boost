export interface RunAuditResponse {
  share_token?: string;
  error?: string;
  score?: number;
  tier?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/** Survives React Strict Mode remounts; prevents duplicate parallel audits. */
let auditRequestStarted = false;

export function resetAuditRequestLock() {
  auditRequestStarted = false;
}

function getRunAuditUrl(): string {
  const region = "forceFunctionRegion=eu-west-1";
  if (import.meta.env.DEV) {
    return `/api/run-audit?${region}`;
  }
  return `${SUPABASE_URL}/functions/v1/run-audit?${region}`;
}

export async function invokeRunAudit(
  body: Record<string, unknown>,
): Promise<RunAuditResponse> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("App is missing Supabase configuration. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(getRunAuditUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({})) as RunAuditResponse;

    if (!response.ok) {
      throw new Error(payload.error || `Audit failed (HTTP ${response.status}). Please try again.`);
    }

    return payload;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("The audit took too long. Please try again.");
    }
    if (err instanceof TypeError) {
      throw new Error(
        "Could not reach the audit server. Check your internet connection, or disable ad blockers for this site.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function shouldStartAuditRequest(): boolean {
  if (auditRequestStarted) return false;
  auditRequestStarted = true;
  return true;
}
