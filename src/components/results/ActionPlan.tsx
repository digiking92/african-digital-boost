import { useState } from "react";

interface ActionPlanProps {
  actionPlan: { week_1: string[]; month_1: string[]; month_3: string[] };
  profession: string;
  city: string;
  country: string;
}

const tabs = [
  { key: "week_1", label: "Week 1" },
  { key: "month_1", label: "Month 1" },
  { key: "month_3", label: "Month 3" },
] as const;

export const ActionPlan = ({ actionPlan, profession, city, country }: ActionPlanProps) => {
  const [activeTab, setActiveTab] = useState<"week_1" | "month_1" | "month_3">("week_1");
  const items = actionPlan?.[activeTab] ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground">Your Personalised Visibility Plan</h3>
        <p className="text-sm text-muted-foreground">
          Built specifically for a {profession} in {city}, {country}
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-foreground">{item}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">No actions available for this period.</p>
        )}
      </div>
    </div>
  );
};
