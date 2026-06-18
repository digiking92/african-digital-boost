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
          <p className="text-xs text-muted-foreground font-mono">Competitor #{index + 1}</p>
          <p className="font-semibold text-foreground">{c.name}</p>
        </div>
        <span className="bg-secondary text-foreground px-2 py-0.5 rounded-full text-xs font-medium shrink-0">
          ~{c.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {c.platform && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{c.platform}</span>
        )}
        {c.handle && (
          <span className="text-xs text-muted-foreground font-mono">{c.handle}</span>
        )}
        {c.source === "google" && (
          <span className="text-xs text-emerald-400">Google verified</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground line-clamp-3">{c.insight}</p>
      {hasLink && (
        <p className="text-xs text-primary truncate">{c.link}</p>
      )}
      {!hasLink && (
        <p className="text-xs text-amber-400">No direct profile link available</p>
      )}
    </>
  );

  if (hasLink) {
    return (
      <a
        href={c.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-border bg-secondary/30 p-4 hover:border-primary/30 transition-colors space-y-2"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2">
      {content}
    </div>
  );
};

export const CompetitorTable = ({ competitors, city, userName, userScore, competitorQuery }: CompetitorTableProps) => {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-2">
        <h3 className="text-xl font-bold text-foreground">Who's Winning in Your Space</h3>
        {competitorQuery && (
          <p className="text-xs text-muted-foreground font-mono">Searches: {competitorQuery}</p>
        )}
        <p className="text-muted-foreground text-sm">
          No individual competitors with public profile links surfaced yet. Try adding your city and a more specific profession, or we couldn't find LinkedIn/Instagram profiles in your market.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-emerald-500/30 rounded-xl p-6 space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
          Verified from Google
        </span>
        <h3 className="text-xl font-bold text-foreground mt-2">Who's Winning in {city}</h3>
        <p className="text-sm text-muted-foreground">
          {competitors.length} named professionals with real profile links — click to verify on their platform.
        </p>
        {competitorQuery && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Searches: {competitorQuery}
          </p>
        )}
      </div>

      <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-primary">{userName} (You)</p>
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">{userScore}/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {competitors.map((c, i) => (
          <CompetitorCard key={`${c.link}-${i}`} c={c} index={i} />
        ))}
      </div>
    </div>
  );
};
