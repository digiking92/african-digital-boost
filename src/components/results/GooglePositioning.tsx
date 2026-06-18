export interface GoogleResult {
  index?: number;
  title: string;
  link: string;
  snippet: string;
  matchesName?: boolean;
  sourceQuery?: string;
}

interface GooglePositioningProps {
  results: GoogleResult[];
  fullName: string;
  primaryQuery?: string;
}

export const GooglePositioning = ({ results, fullName, primaryQuery }: GooglePositioningProps) => (
  <div className="bg-card border border-emerald-500/30 rounded-xl p-6 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Verified from Google
          </span>
        </div>
        <h3 className="text-xl font-bold text-foreground">What Google Shows for "{fullName}"</h3>
        <p className="text-sm text-muted-foreground">
          Live search results — click any link to verify yourself.
        </p>
        {primaryQuery && (
          <p className="text-xs text-muted-foreground mt-1">
            Primary search: <span className="text-foreground font-mono">"{primaryQuery}"</span>
          </p>
        )}
      </div>
    </div>

    {results.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No Google results found for your name.
      </p>
    ) : (
      <div className="space-y-3">
        {results.map((result, i) => (
          <a
            key={result.link + i}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-lg border p-4 hover:border-primary/40 transition-colors ${
              result.matchesName
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-border bg-secondary/40"
            }`}
          >
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-xs text-primary font-mono">#{result.index ?? i + 1}</p>
              {result.matchesName && (
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Matches your name
                </span>
              )}
              {result.sourceQuery && (
                <span className="text-xs text-muted-foreground truncate">
                  via "{result.sourceQuery}"
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground line-clamp-2">{result.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
            <p className="text-xs text-primary/80 mt-2 truncate">{result.link}</p>
          </a>
        ))}
      </div>
    )}
  </div>
);
