import { AuditSection, AuditSubtitle, AuditTitle } from "@/components/ui/audit-ui";

interface ReauditCaptureProps {
  existingEmail?: string | null;
}

export const ReauditCapture = ({ existingEmail }: ReauditCaptureProps) => {
  if (existingEmail) {
    return (
      <AuditSection variant="highlight" className="text-center">
        <AuditTitle>Your report is on its way</AuditTitle>
        <AuditSubtitle>
          We sent your full AuditME report to{" "}
          <span className="text-[#4ADE80]">{existingEmail}</span>.
          We&apos;ll also email you an updated score in 30 days.
        </AuditSubtitle>
      </AuditSection>
    );
  }

  return (
    <AuditSection>
      <div>
        <AuditTitle>Track Your Progress</AuditTitle>
        <AuditSubtitle>
          We&apos;ll re-scan your Google presence in 30 days and email you your updated score for free.
        </AuditSubtitle>
      </div>
      <p className="text-sm text-white/55">
        Your email was not captured for this audit. Run a new audit from the homepage to get reports by email.
      </p>
    </AuditSection>
  );
};
