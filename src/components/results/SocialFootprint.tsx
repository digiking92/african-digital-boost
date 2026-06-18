export interface SocialProfile {
  platform: string;
  label: string;
  handle: string;
  url: string;
  status: "found" | "not_found" | "blocked" | "unknown";
  title?: string;
  foundInGoogle: boolean;
  discoverabilityGap: boolean;
}

const statusConfig: Record<SocialProfile["status"], { label: string; className: string }> = {
  found: { label: "Profile found", className: "bg-emerald-500/20 text-emerald-300" },
  not_found: { label: "Not found", className: "bg-red-500/20 text-red-300" },
  blocked: { label: "Exists (limited view)", className: "bg-amber-500/20 text-amber-200" },
  unknown: { label: "Could not verify", className: "bg-secondary text-muted-foreground" },
};

interface SocialFootprintProps {
  profiles: SocialProfile[];
}

export const SocialFootprint = ({ profiles }: SocialFootprintProps) => {
  if (profiles.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-2">
        <h3 className="text-xl font-bold text-foreground">Your Social Footprint</h3>
        <p className="text-sm text-muted-foreground">
          No handle provided — we only checked what Google shows. Add your @handle next time for a deeper social audit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground">Your Social Footprint</h3>
        <p className="text-sm text-muted-foreground">
          We checked your profiles and whether Google surfaces them when people search your name.
        </p>
      </div>

      <div className="space-y-3">
        {profiles.map((profile) => {
          const status = statusConfig[profile.status];
          return (
            <div key={profile.platform} className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{profile.label}</p>
                  <p className="text-sm text-muted-foreground">@{profile.handle}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${status.className}`}>
                  {status.label}
                </span>
              </div>

              {profile.discoverabilityGap && (
                <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                  You have this profile, but Google doesn't show it when people search your name — a visibility gap we can fix.
                </p>
              )}

              {profile.foundInGoogle && (
                <p className="text-xs text-emerald-300">
                  ✓ This profile appears in Google search results
                </p>
              )}

              <a
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate block"
              >
                {profile.url}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
