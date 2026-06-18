export interface VerifiedFinding {
  text: string;
  source: string;
  type?: "google" | "social" | "score";
}

interface VerifiedFindingsProps {
  findings: VerifiedFinding[];
}

export const VerifiedFindings = ({ findings }: VerifiedFindingsProps) => {
  if (!findings.length) return null;

  return (
    <div className="bg-card border border-emerald-500/30 rounded-xl p-6 space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
          Verified facts
        </span>
        <h3 className="text-xl font-bold text-foreground mt-2">What We Confirmed</h3>
        <p className="text-sm text-muted-foreground">
          These come directly from Google search and profile checks — not AI guesses.
        </p>
      </div>
      <ul className="space-y-3">
        {findings.map((finding, i) => (
          <li key={i} className="flex gap-3 items-start text-sm">
            <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
            <div>
              <p className="text-foreground">{finding.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Source: {finding.source}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
