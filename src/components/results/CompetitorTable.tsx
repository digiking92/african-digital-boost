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

export const CompetitorTable = ({ competitors, city, userName, userScore, competitorQuery }: CompetitorTableProps) => {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-2">
        <h3 className="text-xl font-bold text-foreground">Who's Winning in Your Space</h3>
        {competitorQuery && (
          <p className="text-xs text-muted-foreground font-mono">Searches: {competitorQuery}</p>
        )}
        <p className="text-muted-foreground text-sm">
          No direct competitors surfaced in Google for your profession and location — you may have a first-mover advantage.
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
          {competitors.length} professionals doing similar work — pulled from live search results with links you can verify.
        </p>
        {competitorQuery && (
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Searches: {competitorQuery}
          </p>
        )}
      </div>

      {/* You */}
      <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-primary">{userName} (You)</p>
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">{userScore}/100</span>
        </div>
      </div>

      <div className="space-y-3">
        {competitors.map((c, i) => (
          <a
            key={c.link || i}
            href={c.link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border bg-secondary/30 p-4 hover:border-primary/30 transition-colors space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground font-mono">Competitor #{i + 1}</p>
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

            <p className="text-xs text-muted-foreground line-clamp-2">{c.insight}</p>
            {c.link && (
              <p className="text-xs text-primary truncate">{c.link}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};
