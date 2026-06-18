import { polishExpertNarrative } from "@/lib/expertCopy";
import {
  AuditBadge,
  AuditBody,
  AuditInnerCard,
  AuditLabel,
  AuditSection,
  AuditSubtitle,
  AuditTitle,
} from "@/components/ui/audit-ui";

interface ContentBlueprintProps {
  blueprint: {
    content_types: Array<{ type: string; example_headline: string; platform: string; frequency: string }>;
    competitor_themes: string[];
    first_5_posts: Array<{ title: string; platform: string; hook_line: string }>;
  };
  profession: string;
  firstName: string;
  fullName: string;
}

export const ContentBlueprint = ({ blueprint, profession, firstName, fullName }: ContentBlueprintProps) => (
  <AuditSection variant="highlight">
    <div>
      <AuditBadge variant="outline">Your content plan</AuditBadge>
      <AuditTitle>Content Ideas for {profession}s Like You</AuditTitle>
      <AuditSubtitle>
        Tailored to your audit and references your market and competitors where possible.
      </AuditSubtitle>
    </div>

    {blueprint.content_types?.length > 0 && (
      <div className="space-y-3">
        <AuditLabel>Content types that work</AuditLabel>
        <div className="grid gap-3">
          {blueprint.content_types.map((ct, i) => (
            <AuditInnerCard key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-0.5 rounded-full">{ct.platform}</span>
                <span className="text-xs text-white/55">{ct.frequency}</span>
              </div>
              <p className="text-sm font-medium text-white">{ct.type}</p>
              <p className="text-xs text-white/65 italic">&quot;{ct.example_headline}&quot;</p>
            </AuditInnerCard>
          ))}
        </div>
      </div>
    )}

    {blueprint.competitor_themes?.length > 0 && (
      <div className="space-y-2">
        <AuditLabel>What your competitors are posting</AuditLabel>
        <ul className="space-y-2">
          {blueprint.competitor_themes.map((t, i) => (
            <li key={i} className="text-sm text-white/85 flex items-start gap-2">
              <span className="text-[#4ADE80] mt-0.5">•</span>
              {polishExpertNarrative(t, firstName, fullName)}
            </li>
          ))}
        </ul>
      </div>
    )}

    {blueprint.first_5_posts?.length > 0 && (
      <div className="space-y-3">
        <AuditLabel>Your first 5 post ideas</AuditLabel>
        <div className="space-y-2">
          {blueprint.first_5_posts.map((post, i) => (
            <AuditInnerCard key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4ADE80] text-[#0D1B2A] text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <span className="text-xs bg-[#1a2d42] text-white/70 px-2 py-0.5 rounded">{post.platform}</span>
                <p className="text-sm font-medium text-white mt-1">{post.title}</p>
                <p className="text-xs text-white/65 italic mt-0.5">&quot;{post.hook_line}&quot;</p>
              </div>
            </AuditInnerCard>
          ))}
        </div>
      </div>
    )}
  </AuditSection>
);
