import { AuditSection, AuditSubtitle, AuditTitle } from "@/components/ui/audit-ui";

const metrics = [
  { label: "Google Search Results", key: "google_results", max: 25 },
  { label: "Social Media & Discoverability", key: "social_presence", max: 25 },
  { label: "Content & Thought Leadership", key: "content_footprint", max: 25 },
  { label: "Brand Clarity & Consistency", key: "brand_clarity", max: 25 },
];

interface ScoreBreakdownProps {
  breakdown: Record<string, number>;
  explanations?: Record<string, string>;
}

export const ScoreBreakdown = ({ breakdown, explanations }: ScoreBreakdownProps) => (
  <AuditSection>
    <div>
      <AuditTitle>Score Breakdown</AuditTitle>
      <AuditSubtitle>Calculated from verified search data using fixed rules.</AuditSubtitle>
    </div>
    <div className="space-y-5">
      {metrics.map((m) => {
        const value = breakdown?.[m.key] ?? 0;
        const pct = (value / m.max) * 100;
        const explanation = explanations?.[m.key];
        return (
          <div key={m.key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/75">{m.label}</span>
              <span className="text-white font-semibold">{value}/{m.max}</span>
            </div>
            <div className="w-full h-2.5 bg-[#0D1B2A] rounded-full overflow-hidden border border-[#4ADE80]/15">
              <div
                className="h-full bg-[#4ADE80] rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
            {explanation && (
              <p className="text-xs text-white/60 leading-relaxed">{explanation}</p>
            )}
          </div>
        );
      })}
    </div>
  </AuditSection>
);
