const metrics = [
  { label: "Google Search Results", key: "google_results", max: 25 },
  { label: "Social Media & Discoverability", key: "social_presence", max: 25 },
  { label: "Content & Thought Leadership", key: "content_footprint", max: 25 },
  { label: "Brand Clarity & Consistency", key: "brand_clarity", max: 25 },
];

interface ScoreBreakdownProps {
  breakdown: Record<string, number>;
}

export const ScoreBreakdown = ({ breakdown }: ScoreBreakdownProps) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-foreground">What We Checked</h3>
    <div className="space-y-3">
      {metrics.map((m) => {
        const value = breakdown?.[m.key] ?? 0;
        const pct = (value / m.max) * 100;
        return (
          <div key={m.key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="text-foreground font-medium">{value}/{m.max}</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
