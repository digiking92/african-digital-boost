export interface QueryRun {
  query: string;
  type: "name" | "profession" | "city" | "competitors";
  resultCount: number;
}

interface AuditTransparencyProps {
  searchedAt?: string;
  queriesRun?: QueryRun[];
  competitorQuery?: string;
  city: string;
  country: string;
}

const queryLabels: Record<QueryRun["type"], string> = {
  name: "Name search",
  profession: "Name + profession",
  city: "Name + city",
  competitors: "Competitor benchmark",
};

export const AuditTransparency = ({
  searchedAt,
  queriesRun,
  competitorQuery,
  city,
  country,
}: AuditTransparencyProps) => {
  if (!queriesRun?.length && !searchedAt) return null;

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3 text-sm">
      <p className="font-semibold text-foreground">How this audit was run</p>
      {searchedAt && (
        <p className="text-xs text-muted-foreground">
          Searched: {new Date(searchedAt).toLocaleString()} · Location context: {city}, {country}
        </p>
      )}
      {queriesRun && queriesRun.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Exact Google queries</p>
          <ul className="space-y-1">
            {queriesRun.map((q, i) => (
              <li key={i} className="text-xs font-mono text-foreground/90 flex flex-wrap gap-x-2">
                <span className="text-muted-foreground">{queryLabels[q.type]}:</span>
                <span>"{q.query}"</span>
                <span className="text-muted-foreground">({q.resultCount} results)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Scores use rules on these results. Interpretation below is AI-generated from this data.
      </p>
    </div>
  );
};
