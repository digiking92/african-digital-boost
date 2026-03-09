interface ScoreHeroProps {
  firstName: string;
  score: number;
  tier: string;
}

const tierConfig: Record<string, { emoji: string; color: string; message: string }> = {
  Ghost: {
    emoji: "👻",
    color: "text-muted-foreground",
    message: "You're completely invisible online. Clients are searching for you and finding nothing — or someone else.",
  },
  Shadow: {
    emoji: "🌑",
    color: "text-tier-shadow",
    message: "You exist online but you're not saying anything. Your digital silence is costing you clients.",
  },
  Emerging: {
    emoji: "🌅",
    color: "text-tier-emerging",
    message: "You have a foundation but it's inconsistent. You're findable, but not convincing.",
  },
  Visible: {
    emoji: "✅",
    color: "text-tier-visible",
    message: "You have a solid presence. Now it's time to become the go-to authority in your space.",
  },
  Authority: {
    emoji: "🏆",
    color: "text-primary",
    message: "You're one of the most visible professionals in your field. Now protect and scale it.",
  },
};

export const ScoreHero = ({ firstName, score, tier }: ScoreHeroProps) => {
  const config = tierConfig[tier] || tierConfig.Ghost;
  const circumference = 283;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="text-center space-y-6">
      <p className="text-muted-foreground text-lg">
        Here's your Google Presence Report, <span className="text-foreground font-semibold">{firstName}</span>
      </p>

      {/* Score circle */}
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-score-fill"
            style={{ "--score-offset": offset } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-foreground">{score}</span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-2xl font-bold">
          <span className="mr-2">{config.emoji}</span>
          <span className={config.color}>{tier}</span>
        </p>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">{config.message}</p>
      </div>
    </div>
  );
};
