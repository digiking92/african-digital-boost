import { AuditInnerCard, AuditLabel } from "@/components/ui/audit-ui";

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
  city,
  country,
}: AuditTransparencyProps) => {
  if (!queriesRun?.length && !searchedAt) return null;

  return (
    <AuditInnerCard className="space-y-3 text-sm">
      <p className="font-semibold text-white">How this audit was run</p>
      {searchedAt && (
        <p className="text-xs text-white/60">
          Searched: {new Date(searchedAt).toLocaleString()} · Location context: {city}, {country}
        </p>
      )}
      {queriesRun && queriesRun.length > 0 && (
        <div className="space-y-2">
          <AuditLabel>Exact Google queries</AuditLabel>
          <ul className="space-y-1.5">
            {queriesRun.map((q, i) => (
              <li key={i} className="text-xs font-mono text-white/85 flex flex-wrap gap-x-2">
                <span className="text-white/55">{queryLabels[q.type]}:</span>
                <span>&quot;{q.query}&quot;</span>
                <span className="text-white/55">({q.resultCount} results)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-white/55">
        Scores use rules on these results. Interpretation below is AI-generated from this data.
      </p>
    </AuditInnerCard>
  );
};
