import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeadersFor } from "../_shared/cors.ts";

const VALID_STATUSES = new Set(["new", "contacted", "interested", "booked", "closed", "no_response"]);

const loginAttempts = new Map<string, { count: number; resetAt: number; lockedUntil: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_LOCK_MS = 30 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",").at(-1)?.trim() || "unknown";
}

function isLoginLocked(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  return !!entry && Date.now() < entry.lockedUntil;
}

function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS, lockedUntil: 0 });
    return;
  }
  entry.count += 1;
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOGIN_LOCK_MS;
  }
}

function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

function verifyPassword(provided: string, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  return timingSafeEqual(provided, expected);
}

serve(async (req) => {
  const cors = corsHeadersFor(req);

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  const clientIp = getClientIp(req);
  if (isLoginLocked(clientIp)) {
    return json({ error: "Too many failed login attempts. Try again later." }, 429);
  }

  try {
    const ADMIN_DASHBOARD_PASSWORD = Deno.env.get("ADMIN_DASHBOARD_PASSWORD");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ADMIN_DASHBOARD_PASSWORD || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "Admin dashboard is not configured." }, 503);
    }

    const body = await req.json();
    const password = String(body.password || "");

    if (!verifyPassword(password, ADMIN_DASHBOARD_PASSWORD)) {
      recordFailedLogin(clientIp);
      return json({ error: "Invalid password." }, 401);
    }

    clearLoginAttempts(clientIp);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const action = String(body.action || "list");

    if (action === "verify") {
      return json({ ok: true });
    }

    if (action === "list") {
      const { data: leads, error } = await supabase
        .from("leads")
        .select(`
          id,
          created_at,
          email,
          name,
          profession,
          city,
          country,
          score,
          tier,
          source,
          follow_up_status,
          notes,
          report_sent_at,
          report_url,
          audit_id,
          audits ( share_token )
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        console.error("admin list error:", error);
        return json({ error: "Could not load leads." }, 500);
      }

      const today = new Date().toISOString().slice(0, 10);
      const mapped = (leads || []).map((row) => {
        const audit = row.audits as { share_token?: string } | null;
        return {
          id: row.id,
          created_at: row.created_at,
          email: row.email,
          name: row.name,
          profession: row.profession,
          city: row.city,
          country: row.country,
          score: row.score,
          tier: row.tier,
          source: row.source,
          follow_up_status: row.follow_up_status || "new",
          notes: row.notes,
          report_sent_at: row.report_sent_at,
          report_url: row.report_url,
          audit_id: row.audit_id,
          share_token: audit?.share_token ?? null,
        };
      });

      const stats = {
        total_leads: mapped.length,
        leads_today: mapped.filter((l) => l.created_at?.startsWith(today)).length,
        reports_sent: mapped.filter((l) => l.report_sent_at).length,
        avg_score: mapped.length
          ? Math.round(
            mapped.reduce((sum, l) => sum + (l.score ?? 0), 0) / mapped.filter((l) => l.score != null).length,
          ) || null
          : null,
      };

      return json({ leads: mapped, stats });
    }

    if (action === "update") {
      const leadId = String(body.leadId || "");
      if (!leadId) return json({ error: "Missing leadId." }, 400);

      const patch: Record<string, string> = {};
      if (body.follow_up_status != null) {
        const status = String(body.follow_up_status);
        if (!VALID_STATUSES.has(status)) {
          return json({ error: "Invalid follow_up_status." }, 400);
        }
        patch.follow_up_status = status;
      }
      if (body.notes != null) {
        patch.notes = String(body.notes).slice(0, 2000);
      }

      if (Object.keys(patch).length === 0) {
        return json({ error: "Nothing to update." }, 400);
      }

      const { error } = await supabase.from("leads").update(patch).eq("id", leadId);
      if (error) {
        console.error("admin update error:", error);
        return json({ error: "Could not update lead." }, 500);
      }

      return json({ ok: true });
    }

    return json({ error: "Unknown action." }, 400);
  } catch (err) {
    console.error("admin-dashboard error:", err);
    return json({ error: "Server error." }, 500);
  }
});
