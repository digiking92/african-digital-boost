import {
  AuditBadge,
  AuditBody,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

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
    <AuditSection variant="verified">
      <div>
        <AuditBadge>Verified facts</AuditBadge>
        <AuditTitle>What We Confirmed</AuditTitle>
        <AuditSubtitle>These come directly from Google search and profile checks, not AI guesses.</AuditSubtitle>
      </div>
      <ul className="space-y-3">
        {findings.map((finding, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="text-[#4ADE80] shrink-0 mt-0.5 font-bold">✓</span>
            <div>
              <AuditBody>{finding.text}</AuditBody>
              <p className="text-xs text-white/55 mt-1">Source: {finding.source}</p>
            </div>
          </li>
        ))}
      </ul>
    </AuditSection>
  );
};
