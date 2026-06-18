export type FollowUpStatus =
  | "new"
  | "contacted"
  | "interested"
  | "booked"
  | "closed"
  | "no_response";

export interface AdminLead {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  profession: string | null;
  city: string | null;
  country: string | null;
  score: number | null;
  tier: string | null;
  source: string | null;
  follow_up_status: FollowUpStatus;
  notes: string | null;
  report_sent_at: string | null;
  report_url: string | null;
  audit_id: string | null;
  share_token: string | null;
}

export interface AdminStats {
  total_leads: number;
  leads_today: number;
  reports_sent: number;
  avg_score: number | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function getAdminUrl(): string {
  const region = "forceFunctionRegion=eu-west-1";
  if (import.meta.env.DEV) {
    return `/api/admin-dashboard?${region}`;
  }
  return `${SUPABASE_URL}/functions/v1/admin-dashboard?${region}`;
}

async function adminFetch<T>(password: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(getAdminUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ ...body, password }),
  });

  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || `Request failed (${response.status})`);
  }
  return payload;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  await adminFetch<{ ok: boolean }>(password, { action: "verify" });
  return true;
}

export async function fetchAdminLeads(password: string): Promise<{ leads: AdminLead[]; stats: AdminStats }> {
  return adminFetch(password, { action: "list" });
}

export async function updateAdminLead(
  password: string,
  leadId: string,
  patch: { follow_up_status?: FollowUpStatus; notes?: string },
): Promise<void> {
  await adminFetch(password, { action: "update", leadId, ...patch });
}
