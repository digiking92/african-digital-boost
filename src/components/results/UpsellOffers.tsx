import { Button } from "@/components/ui/button";

interface UpsellOffersProps {
  upsellHook?: string;
  quickWin?: string;
}

export const UpsellOffers = ({ upsellHook, quickWin }: UpsellOffersProps) => (
  <div className="space-y-4">
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold text-foreground">Want Us to Fix This For You?</h3>
      <p className="text-sm text-muted-foreground">
        {upsellHook || "We specialise in building digital authority for African professionals"}
      </p>
      {quickWin && (
        <p className="text-xs text-primary font-medium">
          Start with: {quickWin}
        </p>
      )}
    </div>

    <div className="grid gap-4">
      <div className="bg-card border-2 border-primary rounded-xl p-6 space-y-4 relative">
        <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </span>
        <div>
          <p className="text-2xl mb-1">🚀</p>
          <h4 className="text-lg font-bold text-foreground">Done-For-You Visibility Package</h4>
          <p className="text-sm text-muted-foreground mt-1">
            We fix your Google positioning, optimise your social profiles, and make sure clients find you — not your competitors.
          </p>
        </div>
        <ul className="space-y-2">
          {[
            "Google & social profile optimisation",
            "3x weekly posts for your profession and city",
            "Get your profiles ranking when people search your name",
            "Monthly visibility re-audit included",
            "Dedicated strategist for African professionals",
          ].map((f, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">✓</span> {f}
            </li>
          ))}
        </ul>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-gold-glow text-base font-bold py-5">
          Book a Free 15-Min Strategy Call
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <span className="text-xs bg-secondary text-muted-foreground px-3 py-1 rounded-full">Quick Win</span>
          <p className="text-2xl mt-2 mb-1">🎯</p>
          <h4 className="text-lg font-bold text-foreground">90-Day Visibility Strategy Session</h4>
          <p className="text-sm text-muted-foreground mt-1">
            One deep session. Leave with a clear system to get found on Google and social.
          </p>
        </div>
        <ul className="space-y-2">
          {[
            "60-min 1-on-1 strategy session",
            "Custom 90-day visibility calendar",
            "Platform-by-platform positioning plan",
            "Delivered as PDF + action checklist",
          ].map((f, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">✓</span> {f}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 text-base font-medium py-5">
          Book Your Strategy Session
        </Button>
      </div>
    </div>
  </div>
);
