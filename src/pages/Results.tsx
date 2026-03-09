import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScoreHero } from "@/components/results/ScoreHero";
import { ScoreBreakdown } from "@/components/results/ScoreBreakdown";
import { CompetitorTable } from "@/components/results/CompetitorTable";
import { ShareCard } from "@/components/results/ShareCard";
import { ActionPlan } from "@/components/results/ActionPlan";
import { ContentBlueprint } from "@/components/results/ContentBlueprint";
import { EffortCallout } from "@/components/results/EffortCallout";
import { UpsellOffers } from "@/components/results/UpsellOffers";
import { Testimonials } from "@/components/results/Testimonials";
import { ReauditCapture } from "@/components/results/ReauditCapture";
import type { Tables } from "@/integrations/supabase/types";

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
  const breakdown = audit.breakdown as Record<string, number>;
  const competitors = audit.competitors as Array<{ name: string; score: number; insight: string }>;
  const actionPlan = audit.action_plan as { week_1: string[]; month_1: string[]; month_3: string[] };
  const contentBlueprint = audit.content_blueprint as {
    content_types: Array<{ type: string; example_headline: string; platform: string; frequency: string }>;
    competitor_themes: string[];
    first_5_posts: Array<{ title: string; platform: string; hook_line: string }>;
  };
  const shareUrl = `${window.location.origin}/results/${audit.share_token}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-12">
        <ScoreHero firstName={firstName} score={audit.score} tier={audit.tier} />
        <ScoreBreakdown breakdown={breakdown} />
        <CompetitorTable competitors={competitors} city={audit.city} userName={audit.full_name} userScore={audit.score} />
        <ShareCard score={audit.score} tier={audit.tier} name={audit.full_name} shareUrl={shareUrl} />
        
        {/* Screen 4 content */}
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
        <UpsellOffers />
        <Testimonials />
        <ReauditCapture auditId={audit.id} />
      </div>
    </div>
  );
};

export default Results;
