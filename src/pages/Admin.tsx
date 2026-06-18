import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  type AdminLead,
  type AdminStats,
  type FollowUpStatus,
  fetchAdminLeads,
  updateAdminLead,
  verifyAdminPassword,
} from "@/lib/adminApi";

const ADMIN_SESSION_KEY = "auditme-admin-password";

const STATUS_OPTIONS: { value: FollowUpStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
  { value: "no_response", label: "No response" },
];

const statusColor: Record<FollowUpStatus, string> = {
  new: "bg-[#4ADE80]/20 text-[#4ADE80]",
  contacted: "bg-blue-500/20 text-blue-300",
  interested: "bg-yellow-500/20 text-yellow-300",
  booked: "bg-[#4ADE80]/30 text-[#4ADE80]",
  closed: "bg-white/10 text-white/60",
  no_response: "bg-red-500/20 text-red-300",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#4ADE80]/20 bg-[#152536] p-4">
      <p className="text-xs uppercase tracking-widest text-white/55">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

const Admin = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) || "");
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FollowUpStatus | "all">("all");

  const loadLeads = useCallback(async (pwd: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminLeads(pwd);
      setLeads(data.leads);
      setStats(data.stats);
    } catch (err) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setPassword("");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!password) return;
    loadLeads(password).catch(() => {
      setLoginError("Session expired. Please log in again.");
    });
  }, [password, loadLeads]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      await verifyAdminPassword(loginInput);
      sessionStorage.setItem(ADMIN_SESSION_KEY, loginInput);
      setPassword(loginInput);
      setLoginInput("");
    } catch {
      setLoginError("Wrong password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setPassword("");
    setLeads([]);
    setStats(null);
  };

  const handleStatusChange = async (leadId: string, follow_up_status: FollowUpStatus) => {
    if (!password) return;
    await updateAdminLead(password, leadId, { follow_up_status });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, follow_up_status } : l)));
  };

  const handleNotesBlur = async (leadId: string, notes: string) => {
    if (!password) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || (lead.notes || "") === notes) return;
    await updateAdminLead(password, leadId, { notes });
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes } : l)));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.follow_up_status !== statusFilter) return false;
      if (!q) return true;
      return [l.name, l.email, l.profession, l.city, l.country, l.tier]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, search, statusFilter]);

  const exportCsv = () => {
    const headers = ["Date", "Name", "Email", "Profession", "City", "Country", "Score", "Tier", "Status", "Report URL", "Notes"];
    const rows = filtered.map((l) => [
      l.created_at,
      l.name || "",
      l.email,
      l.profession || "",
      l.city || "",
      l.country || "",
      l.score ?? "",
      l.tier || "",
      l.follow_up_status,
      l.report_url || "",
      (l.notes || "").replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditme-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!password) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] text-white flex flex-col">
        <header className="border-b border-[#4ADE80]/20 px-4 py-3">
          <BrandMark />
        </header>
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            <h1 className="text-2xl font-bold text-center">Admin Dashboard</h1>
            <p className="text-sm text-white/65 text-center">
              View survey submissions and follow up with leads.
            </p>
            <Input
              type="password"
              placeholder="Dashboard password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="audit-input h-12"
              autoFocus
            />
            {loginError && <p className="text-sm text-red-400">{loginError}</p>}
            <Button type="submit" disabled={loading || !loginInput} className="w-full brand-cta">
              {loading ? "Checking..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <header className="sticky top-0 z-50 bg-[#0D1B2A] border-b border-[#4ADE80]/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLeads(password)}
              disabled={loading}
              className="border-[#4ADE80]/30 text-[#4ADE80] bg-transparent"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/20 text-white/70 bg-transparent"
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Leads &amp; Follow-ups</h1>
          <p className="text-sm text-white/65 mt-1">
            Everyone who completed the survey with their email and audit details.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total leads" value={stats.total_leads} />
            <StatCard label="Today" value={stats.leads_today} />
            <StatCard label="Reports sent" value={stats.reports_sent} />
            <StatCard label="Avg score" value={stats.avg_score ?? "N/A"} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="audit-input flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FollowUpStatus | "all")}
            className="audit-input h-10 rounded-md px-3 text-sm bg-[#152536] border border-[#4ADE80]/25"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button onClick={exportCsv} className="brand-cta shrink-0">
            Export CSV
          </Button>
        </div>

        <div className="rounded-xl border border-[#4ADE80]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#152536] text-left text-white/65">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Details</th>
                  <th className="p-3 font-medium">Score</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium min-w-[180px]">Notes</th>
                  <th className="p-3 font-medium">Report</th>
                </tr>
              </thead>
              <tbody>
                {loading && leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-white/55">Loading leads...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-white/55">No leads yet.</td>
                  </tr>
                ) : (
                  filtered.map((lead) => (
                    <tr key={lead.id} className="border-t border-[#4ADE80]/10 hover:bg-[#152536]/50">
                      <td className="p-3 whitespace-nowrap text-white/70">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3 font-medium">{lead.name || "N/A"}</td>
                      <td className="p-3">
                        <a href={`mailto:${lead.email}`} className="text-[#4ADE80] hover:underline">
                          {lead.email}
                        </a>
                      </td>
                      <td className="p-3 text-white/70">
                        <div>{lead.profession || "N/A"}</div>
                        <div className="text-xs">{lead.city}, {lead.country}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-semibold text-white">{lead.score ?? "N/A"}</span>
                        {lead.tier && <span className="text-xs text-white/55 ml-1">({lead.tier})</span>}
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.follow_up_status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as FollowUpStatus)}
                          className={`text-xs rounded-full px-2 py-1 border-0 ${statusColor[lead.follow_up_status]}`}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          defaultValue={lead.notes || ""}
                          onBlur={(e) => handleNotesBlur(lead.id, e.target.value)}
                          placeholder="Add note..."
                          className="w-full bg-transparent border border-[#4ADE80]/15 rounded px-2 py-1 text-xs text-white placeholder:text-white/35 focus:border-[#4ADE80]/40 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        {(lead.report_url || lead.share_token) ? (
                          <a
                            href={lead.report_url || `/results/${lead.share_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4ADE80] text-xs hover:underline whitespace-nowrap"
                          >
                            View report
                          </a>
                        ) : (
                          <span className="text-white/40 text-xs">N/A</span>
                        )}
                        {lead.report_sent_at && (
                          <div className="text-[10px] text-white/40 mt-0.5">Emailed</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
