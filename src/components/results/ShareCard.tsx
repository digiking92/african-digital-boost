import { Button } from "@/components/ui/button";

interface ShareCardProps {
  score: number;
  tier: string;
  name: string;
  shareUrl: string;
}

export const ShareCard = ({ score, tier, name, shareUrl }: ShareCardProps) => {
  const linkedinText = encodeURIComponent(
    `I just ran a Google Presence Audit on DigitalSelf and scored ${score}/100 — I'm a "${tier}" online. 😅 If you're a professional in Africa and you've never checked how you appear on Google, you need to see this. Run yours free here 👇 ${shareUrl}`
  );
  const twitterText = encodeURIComponent(
    `Just found out I'm a "${tier}" on Google (${score}/100). Every client I don't have online is finding someone else. Fixing that. You should check yours too 👇 ${shareUrl} #DigitalPresence #AfricanProfessionals`
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
      <h3 className="text-xl font-bold text-foreground">Challenge Your Network</h3>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank")}
          className="bg-[hsl(210,80%,45%)] hover:bg-[hsl(210,80%,40%)] text-white"
        >
          Share on LinkedIn
        </Button>
        <Button
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${twitterText}`, "_blank")}
          variant="secondary"
        >
          Share on Twitter/X
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
          }}
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10"
        >
          Copy Link
        </Button>
      </div>
    </div>
  );
};
