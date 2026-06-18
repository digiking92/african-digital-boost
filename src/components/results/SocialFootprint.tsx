import {
  AuditBadge,
  AuditInnerCard,
  AuditLink,
  AuditMuted,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

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
  found: { label: "Profile found", className: "bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30" },
  not_found: { label: "Not found", className: "bg-white/10 text-white/70 border border-white/20" },
  blocked: { label: "Exists (limited view)", className: "bg-[#4ADE80]/10 text-white border border-[#4ADE80]/25" },
  unknown: { label: "Could not verify", className: "bg-white/5 text-white/60 border border-white/15" },
};

interface SocialFootprintProps {
  profiles: SocialProfile[];
}

export const SocialFootprint = ({ profiles }: SocialFootprintProps) => {
  if (profiles.length === 0) {
    return (
      <AuditSection>
        <AuditTitle>Your Social Footprint</AuditTitle>
        <AuditMuted>
          No handle provided. We only checked what Google shows. Add your @handle next time for a deeper social audit.
        </AuditMuted>
      </AuditSection>
    );
  }

  return (
    <AuditSection variant="verified">
      <div>
        <AuditBadge>Verified checks</AuditBadge>
        <AuditTitle>Your Social Footprint</AuditTitle>
        <AuditSubtitle>
          We checked your profiles and whether Google surfaces them when people search your name.
        </AuditSubtitle>
      </div>

      <div className="space-y-3">
        {profiles.map((profile) => {
          const status = statusConfig[profile.status];
          return (
            <AuditInnerCard key={profile.platform} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{profile.label}</p>
                  <p className="text-sm text-white/65">@{profile.handle}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${status.className}`}>
                  {status.label}
                </span>
              </div>

              {profile.discoverabilityGap && (
                <p className="text-xs text-white bg-[#1a3048] border border-[#4ADE80]/30 rounded-md px-3 py-2">
                  You have this profile, but Google doesn&apos;t show it when people search your name. That is a visibility gap we can fix.
                </p>
              )}

              {profile.foundInGoogle && (
                <p className="text-xs text-[#4ADE80]">✓ This profile appears in Google search results</p>
              )}

              <AuditLink href={profile.url}>{profile.url}</AuditLink>
            </AuditInnerCard>
          );
        })}
      </div>
    </AuditSection>
  );
};
