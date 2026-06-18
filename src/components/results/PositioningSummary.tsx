import { polishExpertNarrative, polishVerifiedClaim, toDirectAdvice } from "@/lib/expertCopy";
import {
  AuditBadge,
  AuditBody,
  AuditInnerCard,
  AuditLabel,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

interface SourcedClaim {
  claim: string;
  source: string;
}

interface PositioningSummaryProps {
  firstName: string;
  fullName: string;
  interpretationSummary?: string;
  discoveryEstimate?: string;
  biggestQuickWin?: string;
  sourcedClaims?: SourcedClaim[];
  diagnosisSummary?: string;
  aiVisibilitySummary?: string;
}

export const PositioningSummary = ({
  firstName,
  fullName,
  interpretationSummary,
  discoveryEstimate,
  biggestQuickWin,
  sourcedClaims,
  diagnosisSummary,
  aiVisibilitySummary,
}: PositioningSummaryProps) => {
  const interpretation = interpretationSummary || diagnosisSummary;
  const discovery = discoveryEstimate || aiVisibilitySummary;
  const expertRead = interpretation ? polishExpertNarrative(interpretation, firstName, fullName) : "";
  const perception = discovery ? polishExpertNarrative(discovery, firstName, fullName) : "";
  const quickWin = biggestQuickWin ? toDirectAdvice(biggestQuickWin) : "";

  if (!expertRead && !perception && !quickWin && !sourcedClaims?.length) return null;

  return (
    <AuditSection variant="highlight">
      <div>
        <AuditBadge variant="outline">Your expert read</AuditBadge>
        <AuditTitle>{firstName}, here&apos;s what I see</AuditTitle>
        <AuditSubtitle>
          I reviewed your data. Here&apos;s my honest read. Click any source to verify.
        </AuditSubtitle>
      </div>

      {sourcedClaims && sourcedClaims.length > 0 && (
        <div className="space-y-2">
          <AuditLabel>What I found about you online</AuditLabel>
          <ul className="space-y-3">
            {sourcedClaims.map((item, i) => (
              <li key={i} className="border-l-2 border-[#4ADE80]/50 pl-3">
                <AuditBody>{polishVerifiedClaim(item.claim, firstName, fullName)}</AuditBody>
                <p className="text-xs text-white/55 mt-1">Source: {item.source}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {expertRead && (
        <AuditInnerCard>
          <AuditLabel>My take on your positioning</AuditLabel>
          <AuditBody className="mt-2">{expertRead}</AuditBody>
        </AuditInnerCard>
      )}

      {perception && (
        <AuditInnerCard>
          <AuditLabel>How strangers likely see you on Google</AuditLabel>
          <AuditBody className="mt-2">{perception}</AuditBody>
        </AuditInnerCard>
      )}

      {quickWin && (
        <div className="rounded-xl border border-[#4ADE80]/45 bg-[#4ADE80]/10 p-4">
          <AuditLabel>What you should do this week</AuditLabel>
          <p className="text-sm font-medium text-white mt-2 leading-relaxed">{quickWin}</p>
        </div>
      )}
    </AuditSection>
  );
};
