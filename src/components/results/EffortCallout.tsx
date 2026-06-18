import { AuditBody, AuditSection, AuditTitle } from "@/components/ui/audit-ui";

export const EffortCallout = () => (
  <AuditSection className="border-[#4ADE80]/30 bg-[#4ADE80]/5">
    <AuditTitle>⏱️ The Hard Truth</AuditTitle>
    <AuditBody>
      This plan works. But executing it properly takes 8 to 12 hours per week, consistently, for months.
      Most professionals who start strong quit by week 3. Not because they don&apos;t care, but because client
      work always takes over. That&apos;s not a motivation problem. That&apos;s a bandwidth problem.
    </AuditBody>
  </AuditSection>
);
