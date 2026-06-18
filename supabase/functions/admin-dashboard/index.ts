import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_STATUSES = new Set(["new", "contacted", "interested", "booked", "closed", "no_response"]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function verifyPassword(provided: string, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  return provided === expected;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
      return json({ error: "Invalid password." }, 401);
    }

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
