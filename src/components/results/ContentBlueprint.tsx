interface ContentBlueprintProps {
  blueprint: {
    content_types: Array<{ type: string; example_headline: string; platform: string; frequency: string }>;
    competitor_themes: string[];
    first_5_posts: Array<{ title: string; platform: string; hook_line: string }>;
  };
  profession: string;
}

export const ContentBlueprint = ({ blueprint, profession }: ContentBlueprintProps) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-foreground">
      What Content to Put Out (For {profession}s)
    </h3>

    {/* Content types */}
    {blueprint.content_types?.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-primary">Content Types That Work</h4>
        <div className="grid gap-3">
          {blueprint.content_types.map((ct, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{ct.platform}</span>
                <span className="text-xs text-muted-foreground">{ct.frequency}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{ct.type}</p>
              <p className="text-xs text-muted-foreground italic">"{ct.example_headline}"</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Competitor themes */}
    {blueprint.competitor_themes?.length > 0 && (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-primary">What Your Competitors Are Posting</h4>
        <ul className="space-y-1">
          {blueprint.competitor_themes.map((t, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span> {t}
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* First 5 posts */}
    {blueprint.first_5_posts?.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-primary">Your First 5 Post Ideas</h4>
        <div className="space-y-2">
          {blueprint.first_5_posts.map((post, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-3 flex gap-3 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{post.platform}</span>
                </div>
                <p className="text-sm font-medium text-foreground mt-1">{post.title}</p>
                <p className="text-xs text-muted-foreground italic mt-0.5">"{post.hook_line}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
