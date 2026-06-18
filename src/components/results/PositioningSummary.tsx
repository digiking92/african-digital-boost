interface SourcedClaim {
  claim: string;
  source: string;
}

interface PositioningSummaryProps {
  interpretationSummary?: string;
  discoveryEstimate?: string;
  biggestQuickWin?: string;
  sourcedClaims?: SourcedClaim[];
  /** @deprecated legacy audits */
  diagnosisSummary?: string;
  aiVisibilitySummary?: string;
}

export const PositioningSummary = ({
  interpretationSummary,
  discoveryEstimate,
  biggestQuickWin,
  sourcedClaims,
  diagnosisSummary,
  aiVisibilitySummary,
}: PositioningSummaryProps) => {
  const interpretation = interpretationSummary || diagnosisSummary;
  const discovery = discoveryEstimate || aiVisibilitySummary;

  if (!interpretation && !discovery && !biggestQuickWin && !sourcedClaims?.length) return null;

  return (
    <div className="bg-card border border-amber-500/30 rounded-xl p-6 space-y-5">
      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
          AI interpretation
        </span>
        <h3 className="text-xl font-bold text-foreground mt-2">Our Expert Read</h3>
        <p className="text-sm text-muted-foreground">
          Generated from verified data above — suggestions, not guaranteed facts. Always click sources to confirm.
        </p>
      </div>

      {sourcedClaims && sourcedClaims.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Claims with sources</p>
          <ul className="space-y-2">
            {sourcedClaims.map((item, i) => (
              <li key={i} className="text-sm border-l-2 border-amber-500/40 pl-3">
                <p className="text-foreground">{item.claim}</p>
                <p className="text-xs text-muted-foreground mt-0.5">→ {item.source}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {interpretation && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Positioning summary</p>
          <p className="text-sm text-foreground leading-relaxed">{interpretation}</p>
        </div>
      )}

      {discovery && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Estimated public perception
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            Not a live Google AI Overview — estimated from findable public data only.
          </p>
          <p className="text-sm text-foreground leading-relaxed">{discovery}</p>
        </div>
      )}

      {biggestQuickWin && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Suggested quick win</p>
          <p className="text-sm font-medium text-foreground">{biggestQuickWin}</p>
        </div>
      )}
    </div>
  );
};
