import { Button } from "@/components/ui/button";
import { AuditInnerCard, AuditSection, AuditSubtitle, AuditTitle } from "@/components/ui/audit-ui";

interface UpsellOffersProps {
  upsellHook?: string;
  quickWin?: string;
}

export const UpsellOffers = ({ upsellHook, quickWin }: UpsellOffersProps) => (
  <div className="space-y-6">
    <div className="text-center space-y-2">
      <AuditTitle>Want Us to Fix This For You?</AuditTitle>
      <AuditSubtitle>
        {upsellHook || "We specialise in building digital authority for African professionals"}
      </AuditSubtitle>
      {quickWin && (
        <p className="text-xs text-[#4ADE80] font-medium">Start with: {quickWin}</p>
      )}
    </div>

    <div className="grid gap-4">
      <AuditSection variant="highlight" className="relative pt-8">
        <span className="absolute -top-3 left-4 bg-[#4ADE80] text-[#0D1B2A] text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </span>
        <div>
          <p className="text-2xl mb-1">🚀</p>
          <h4 className="text-lg font-bold text-white">Done-For-You Visibility Package</h4>
          <AuditSubtitle className="mt-1">
            We fix your Google positioning, optimise your social profiles, and make sure clients find you, not your competitors.
          </AuditSubtitle>
        </div>
        <ul className="space-y-2">
          {[
            "Google & social profile optimisation",
            "3x weekly posts for your profession and city",
            "Get your profiles ranking when people search your name",
            "Monthly visibility re-audit included",
            "Dedicated strategist for African professionals",
          ].map((f, i) => (
            <li key={i} className="text-sm text-white/75 flex items-start gap-2">
              <span className="text-[#4ADE80]">✓</span> {f}
            </li>
          ))}
        </ul>
        <Button className="w-full brand-cta text-base py-5">
          Book a Free 15-Min Strategy Call
        </Button>
      </AuditSection>

      <AuditSection>
        <div>
          <span className="text-xs bg-[#1a2d42] text-white/70 px-3 py-1 rounded-full border border-[#4ADE80]/15">Quick Win</span>
          <p className="text-2xl mt-3 mb-1">🎯</p>
          <h4 className="text-lg font-bold text-white">90-Day Visibility Strategy Session</h4>
          <AuditSubtitle className="mt-1">
            One deep session. Leave with a clear system to get found on Google and social.
          </AuditSubtitle>
        </div>
        <ul className="space-y-2">
          {[
            "60-min 1-on-1 strategy session",
            "Custom 90-day visibility calendar",
            "Platform-by-platform positioning plan",
            "Delivered as PDF + action checklist",
          ].map((f, i) => (
            <li key={i} className="text-sm text-white/75 flex items-start gap-2">
              <span className="text-[#4ADE80]">✓</span> {f}
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          className="w-full border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#4ADE80]/10 bg-transparent text-base font-medium py-5"
        >
          Book Your Strategy Session
        </Button>
      </AuditSection>
    </div>
  </div>
);
