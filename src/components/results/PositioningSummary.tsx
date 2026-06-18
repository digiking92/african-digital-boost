interface PositioningSummaryProps {
  diagnosisSummary?: string;
  aiVisibilitySummary?: string;
  biggestQuickWin?: string;
}

export const PositioningSummary = ({
  diagnosisSummary,
  aiVisibilitySummary,
  biggestQuickWin,
}: PositioningSummaryProps) => {
  if (!diagnosisSummary && !aiVisibilitySummary && !biggestQuickWin) return null;

  return (
    <div className="bg-card border border-primary/30 rounded-xl p-6 space-y-5">
      <div>
        <h3 className="text-xl font-bold text-foreground">How You're Positioned Online</h3>
        <p className="text-sm text-muted-foreground">
          Based on Google results and your social footprint
        </p>
      </div>

      {diagnosisSummary && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Google positioning</p>
          <p className="text-sm text-foreground leading-relaxed">{diagnosisSummary}</p>
        </div>
      )}

      {aiVisibilitySummary && (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">AI & discovery view</p>
          <p className="text-sm text-foreground leading-relaxed">{aiVisibilitySummary}</p>
        </div>
      )}

      {biggestQuickWin && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Your biggest quick win</p>
          <p className="text-sm font-medium text-foreground">{biggestQuickWin}</p>
        </div>
      )}
    </div>
  );
};
