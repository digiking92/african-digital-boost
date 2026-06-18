import {
  AuditBadge,
  AuditInnerCard,
  AuditLink,
  AuditMuted,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

export interface Competitor {
  name: string;
  score: number;
  insight: string;
  link?: string;
  platform?: string;
  handle?: string;
  source?: string;
}

interface CompetitorTableProps {
  competitors: Competitor[];
  city: string;
  userName: string;
  userScore: number;
  competitorQuery?: string;
}

function isValidExternalLink(link?: string): boolean {
  if (!link?.trim()) return false;
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const CompetitorCard = ({ c, index }: { c: Competitor; index: number }) => {
  const hasLink = isValidExternalLink(c.link);
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/55 font-mono">Competitor #{index + 1}</p>
          <p className="font-semibold text-white">{c.name}</p>
        </div>
        <span className="bg-[#1a2d42] text-white px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 border border-[#4ADE80]/20">
          ~{c.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {c.platform && (
          <span className="text-xs bg-[#4ADE80]/15 text-[#4ADE80] px-2 py-0.5 rounded">{c.platform}</span>
        )}
        {c.handle && <span className="text-xs text-white/60 font-mono">{c.handle}</span>}
        {c.source === "google" && (
          <span className="text-xs text-[#4ADE80]">Google verified</span>
        )}
      </div>

      <AuditMuted className="line-clamp-3">{c.insight}</AuditMuted>
      {hasLink && c.link && <AuditLink href={c.link}>{c.link}</AuditLink>}
      {!hasLink && (
        <p className="text-xs text-white/50">No direct profile link available</p>
      )}
    </>
  );

  if (hasLink) {
    return (
      <a
        href={c.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-[#4ADE80]/20 bg-[#0D1B2A]/60 p-4 hover:border-[#4ADE80]/45 transition-colors space-y-2"
      >
        {content}
      </a>
    );
  }

  return (
    <AuditInnerCard className="space-y-2">{content}</AuditInnerCard>
  );
};

export const CompetitorTable = ({ competitors, city, userName, userScore, competitorQuery }: CompetitorTableProps) => {
  if (!competitors || competitors.length === 0) {
    return (
      <AuditSection>
        <AuditTitle>Who&apos;s Winning in Your Space</AuditTitle>
        {competitorQuery && (
          <p className="text-xs text-white/55 font-mono">Searches: {competitorQuery}</p>
        )}
        <AuditMuted>
          No individual competitors with public profile links surfaced yet. Try adding your city and a more specific profession, or we couldn&apos;t find LinkedIn/Instagram profiles in your market.
        </AuditMuted>
      </AuditSection>
    );
  }

  return (
    <AuditSection variant="verified">
      <div>
        <AuditBadge>Verified from Google</AuditBadge>
        <AuditTitle>Who&apos;s Winning in {city}</AuditTitle>
        <AuditSubtitle>
          {competitors.length} named professionals with real profile links. Click to verify on their platform.
        </AuditSubtitle>
        {competitorQuery && (
          <p className="text-xs text-white/55 font-mono mt-2">Searches: {competitorQuery}</p>
        )}
      </div>

      <div className="rounded-xl border-2 border-[#4ADE80]/45 bg-[#4ADE80]/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-[#4ADE80]">{userName} (You)</p>
          <span className="bg-[#4ADE80] text-[#0D1B2A] px-2.5 py-0.5 rounded-full text-xs font-bold">{userScore}/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {competitors.map((c, i) => (
          <CompetitorCard key={`${c.link}-${i}`} c={c} index={i} />
        ))}
      </div>
    </AuditSection>
  );
};
