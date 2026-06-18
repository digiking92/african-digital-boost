import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScoreHero } from "@/components/results/ScoreHero";
import { ScoreBreakdown } from "@/components/results/ScoreBreakdown";
import { AuditTransparency } from "@/components/results/AuditTransparency";
import { VerifiedFindings, type VerifiedFinding } from "@/components/results/VerifiedFindings";
import { GooglePositioning } from "@/components/results/GooglePositioning";
import { SocialFootprint, type SocialProfile } from "@/components/results/SocialFootprint";
import { PositioningSummary } from "@/components/results/PositioningSummary";
import { CompetitorTable } from "@/components/results/CompetitorTable";
import { ShareCard } from "@/components/results/ShareCard";
import { ActionPlan } from "@/components/results/ActionPlan";
import { ContentBlueprint } from "@/components/results/ContentBlueprint";
import { EffortCallout } from "@/components/results/EffortCallout";
import { UpsellOffers } from "@/components/results/UpsellOffers";
import { Testimonials } from "@/components/results/Testimonials";
import { ReauditCapture } from "@/components/results/ReauditCapture";
import type { Tables, Json } from "@/integrations/supabase/types";
import type { GoogleResult } from "@/components/results/GooglePositioning";
import type { QueryRun } from "@/components/results/AuditTransparency";

function parseJsonField<T>(value: Json | null | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

interface RawSearchData {
  googleResults?: GoogleResult[];
  nameResults?: GoogleResult[];
  compResults?: GoogleResult[];
  socialProfiles?: SocialProfile[];
  auditMeta?: {
    searchedAt?: string;
    queriesRun?: QueryRun[];
    competitorQuery?: string;
    breakdownExplanations?: Record<string, string>;
  };
}

interface PositioningData {
  verified_findings?: VerifiedFinding[];
  sourced_claims?: Array<{ claim: string; source: string }>;
  interpretation_summary?: string;
  discovery_estimate?: string;
  biggest_quick_win?: string;
  upsell_hook?: string;
  diagnosis_summary?: string;
  ai_visibility_summary?: string;
}

const Results = () => {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Tables<"audits"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareToken) { navigate("/"); return; }

    const fetchAudit = async () => {
      const { data, error } = await supabase
        .rpc("get_audit_by_share_token", { p_share_token: shareToken })
        .maybeSingle();

      if (error || !data) {
        console.error("Failed to load audit:", error);
        navigate("/");
        return;
      }
      setAudit(data);
      setLoading(false);
    };

    fetchAudit();
  }, [shareToken, navigate]);

  if (loading || !audit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse-gold">Loading your results...</div>
      </div>
    );
  }

  const firstName = audit.full_name.split(" ")[0];
  const breakdown = parseJsonField<Record<string, number>>(audit.breakdown, {});
  const competitors = parseJsonField<Array<{
    name: string;
    score: number;
    insight: string;
    link?: string;
    platform?: string;
    handle?: string;
    source?: string;
  }>>(audit.competitors, [])
    .filter((competitor) => competitor?.name?.trim());
  const actionPlan = parseJsonField<{ week_1: string[]; month_1: string[]; month_3: string[] }>(
    audit.action_plan,
    { week_1: [], month_1: [], month_3: [] },
  );
  const contentBlueprint = parseJsonField<{
    content_types: Array<{ type: string; example_headline: string; platform: string; frequency: string }>;
    competitor_themes: string[];
    first_5_posts: Array<{ title: string; platform: string; hook_line: string }>;
    positioning?: PositioningData;
  }>(audit.content_blueprint, {
    content_types: [],
    competitor_themes: [],
    first_5_posts: [],
  });
  const rawSearch = parseJsonField<RawSearchData>(audit.raw_search_results, {});
  const auditMeta = rawSearch.auditMeta ?? {};
  const googleResults = rawSearch.googleResults ?? rawSearch.nameResults ?? [];
  const socialProfiles = rawSearch.socialProfiles ?? [];
  const positioning = contentBlueprint.positioning ?? {};
  const verifiedFindings = positioning.verified_findings ?? [];
  const primaryQuery = auditMeta.queriesRun?.find((q) => q.type === "name")?.query;

  const searchMayHaveFailed = audit.score === 0
    && Object.values(breakdown).every((value) => value === 0)
    && googleResults.length === 0;

  const shareUrl = `${window.location.origin}/results/${audit.share_token}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-12">
        {searchMayHaveFailed && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            We could not retrieve search data for this audit. Add SERPER_API_KEY in Supabase Edge Function secrets, then run a new audit.
          </div>
        )}
        <ScoreHero firstName={firstName} score={audit.score} tier={audit.tier} />
        <AuditTransparency
          searchedAt={auditMeta.searchedAt}
          queriesRun={auditMeta.queriesRun}
          competitorQuery={auditMeta.competitorQuery}
          city={audit.city}
          country={audit.country}
        />
        <VerifiedFindings findings={verifiedFindings} />
        <GooglePositioning
          results={googleResults}
          fullName={audit.full_name}
          primaryQuery={primaryQuery}
        />
        <SocialFootprint profiles={socialProfiles} />
        <ScoreBreakdown
          breakdown={breakdown}
          explanations={auditMeta.breakdownExplanations}
        />
        <CompetitorTable
          competitors={competitors}
          city={audit.city}
          userName={audit.full_name}
          userScore={audit.score}
          competitorQuery={auditMeta.competitorQuery}
        />
        <PositioningSummary
          interpretationSummary={positioning.interpretation_summary}
          discoveryEstimate={positioning.discovery_estimate}
          biggestQuickWin={positioning.biggest_quick_win}
          sourcedClaims={positioning.sourced_claims}
          diagnosisSummary={positioning.diagnosis_summary}
          aiVisibilitySummary={positioning.ai_visibility_summary}
        />
        <ShareCard score={audit.score} tier={audit.tier} name={audit.full_name} shareUrl={shareUrl} />

        <div id="plan" />
        {actionPlan && (
          <ActionPlan
            actionPlan={actionPlan}
            profession={audit.profession}
            city={audit.city}
            country={audit.country}
          />
        )}
        {contentBlueprint && (
          <ContentBlueprint blueprint={contentBlueprint} profession={audit.profession} />
        )}
        <EffortCallout />
        <UpsellOffers upsellHook={positioning.upsell_hook} quickWin={positioning.biggest_quick_win} />
        <Testimonials />
        <ReauditCapture auditId={audit.id} />
      </div>
    </div>
  );
};

export default Results;
