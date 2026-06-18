import { useState } from "react";
import { toDirectAdvice } from "@/lib/expertCopy";
import {
  AuditBadge,
  AuditBody,
  AuditInnerCard,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

interface ActionPlanProps {
  firstName: string;
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

export const ActionPlan = ({ firstName, actionPlan, profession, city, country }: ActionPlanProps) => {
  const [activeTab, setActiveTab] = useState<"week_1" | "month_1" | "month_3">("week_1");
  const items = (actionPlan?.[activeTab] ?? []).map(toDirectAdvice);

  return (
    <AuditSection variant="highlight">
      <div>
        <AuditBadge variant="outline">Your action plan</AuditBadge>
        <AuditTitle>{firstName}, here&apos;s your roadmap</AuditTitle>
        <AuditSubtitle>
          Built for you as a {profession} in {city}, {country}. Each step is something you can do, not generic advice.
        </AuditSubtitle>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-[#4ADE80] text-[#0D1B2A]"
                : "bg-[#1a2d42] text-white/70 hover:text-white border border-[#4ADE80]/15"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AuditInnerCard className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4ADE80]/20 text-[#4ADE80] text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <AuditBody>{item}</AuditBody>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-white/60 text-sm">No actions available for this period.</p>
        )}
      </AuditInnerCard>
    </AuditSection>
  );
};
