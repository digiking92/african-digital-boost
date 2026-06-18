import {
  AuditBadge,
  AuditInnerCard,
  AuditLink,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

export interface GoogleResult {
  index?: number;
  title: string;
  link: string;
  snippet: string;
  matchesName?: boolean;
  sourceQuery?: string;
}

interface GooglePositioningProps {
  results: GoogleResult[];
  fullName: string;
  primaryQuery?: string;
}

export const GooglePositioning = ({ results, fullName, primaryQuery }: GooglePositioningProps) => (
  <AuditSection variant="verified">
    <div className="space-y-1">
      <AuditBadge>Verified from Google</AuditBadge>
      <AuditTitle>What Google Shows for &quot;{fullName}&quot;</AuditTitle>
      <AuditSubtitle>Live search results. Click any link to verify yourself.</AuditSubtitle>
      {primaryQuery && (
        <p className="text-xs text-white/60 mt-2">
          Primary search: <span className="text-[#4ADE80] font-mono">&quot;{primaryQuery}&quot;</span>
        </p>
      )}
    </div>

    {results.length === 0 ? (
      <p className="text-sm text-white/70">No Google results found for your name.</p>
    ) : (
      <div className="space-y-3">
        {results.map((result, i) => (
          <AuditInnerCard key={result.link + i} highlight={result.matchesName}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-[#4ADE80] font-mono font-bold">#{result.index ?? i + 1}</span>
              {result.matchesName && <AuditBadge>Matches your name</AuditBadge>}
              {result.sourceQuery && (
                <span className="text-xs text-white/55 truncate">
                  via &quot;{result.sourceQuery}&quot;
                </span>
              )}
            </div>
            <p className="text-base font-semibold text-white leading-snug">{result.title}</p>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">{result.snippet}</p>
            <div className="mt-3 pt-2 border-t border-[#4ADE80]/15">
              <AuditLink href={result.link}>{result.link}</AuditLink>
            </div>
          </AuditInnerCard>
        ))}
      </div>
    )}
  </AuditSection>
);
