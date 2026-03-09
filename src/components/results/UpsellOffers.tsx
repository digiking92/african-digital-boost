import { Button } from "@/components/ui/button";

export const UpsellOffers = () => (
  <div className="space-y-4">
    <div className="text-center">
      <h3 className="text-xl font-bold text-foreground">Want Us to Do This For You?</h3>
      <p className="text-sm text-muted-foreground">We specialise in building digital authority for African professionals</p>
    </div>

    <div className="grid gap-4">
      {/* DFY offer */}
      <div className="bg-card border-2 border-primary rounded-xl p-6 space-y-4 relative">
        <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </span>
        <div>
          <p className="text-2xl mb-1">🚀</p>
          <h4 className="text-lg font-bold text-foreground">Done-For-You Social Media Management</h4>
          <p className="text-sm text-muted-foreground mt-1">
            We become your digital PR team. You focus on clients, we make sure Google and LinkedIn work for you 24/7.
          </p>
        </div>
        <ul className="space-y-2">
          {[
            "3x weekly posts crafted for your profession and audience",
            "Full LinkedIn profile optimisation",
            "Monthly Google presence re-audit",
            "Media outreach — we pitch you to African publications",
            "Dedicated content strategist for your niche",
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

      {/* Strategy session */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <span className="text-xs bg-secondary text-muted-foreground px-3 py-1 rounded-full">Quick Win</span>
          <p className="text-2xl mt-2 mb-1">🎯</p>
          <h4 className="text-lg font-bold text-foreground">90-Day Content Strategy Session</h4>
          <p className="text-sm text-muted-foreground mt-1">
            One deep session. Leave with a clear content system built for your brand and profession.
          </p>
        </div>
        <ul className="space-y-2">
          {[
            "60-min 1-on-1 strategy session",
            "Custom 90-day content calendar",
            "Platform-by-platform recommendations",
            "Delivered as PDF + Notion board",
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
