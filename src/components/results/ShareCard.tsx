import { Button } from "@/components/ui/button";
import { AuditSection, AuditTitle } from "@/components/ui/audit-ui";

interface ShareCardProps {
  score: number;
  tier: string;
  name: string;
  shareUrl: string;
}

export const ShareCard = ({ score, tier, shareUrl }: ShareCardProps) => {
  const twitterText = encodeURIComponent(
    `Just found out I'm a "${tier}" on Google (${score}/100). Every client I don't have online is finding someone else. Fixing that. You should check yours too 👇 ${shareUrl} #DigitalPresence #AfricanProfessionals`,
  );

  return (
    <AuditSection className="text-center">
      <AuditTitle>Challenge Your Network</AuditTitle>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          onClick={() =>
            window.open(
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
              "_blank",
            )
          }
          className="brand-cta"
        >
          Share on LinkedIn
        </Button>
        <Button
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${twitterText}`, "_blank")}
          className="bg-[#1a2d42] text-white border border-[#4ADE80]/25 hover:bg-[#243a52]"
        >
          Share on Twitter/X
        </Button>
        <Button
          onClick={() => navigator.clipboard.writeText(shareUrl)}
          variant="outline"
          className="border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#4ADE80]/10 bg-transparent"
        >
          Copy Link
        </Button>
      </div>
    </AuditSection>
  );
};
