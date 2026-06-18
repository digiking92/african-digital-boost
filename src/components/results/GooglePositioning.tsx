export interface GoogleResult {
  title: string;
  link: string;
  snippet: string;
}

interface GooglePositioningProps {
  results: GoogleResult[];
  fullName: string;
}

export const GooglePositioning = ({ results, fullName }: GooglePositioningProps) => (
  <div className="bg-card border border-border rounded-xl p-6 space-y-4">
    <div>
      <h3 className="text-xl font-bold text-foreground">What Google Shows for "{fullName}"</h3>
      <p className="text-sm text-muted-foreground">
        This is what clients, employers, and partners see when they search your name.
      </p>
    </div>

    {results.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        No strong Google results found for your name. You're likely invisible to people searching for you.
      </p>
    ) : (
      <div className="space-y-3">
        {results.map((result, i) => (
          <a
            key={i}
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border bg-secondary/40 p-4 hover:border-primary/40 transition-colors"
          >
            <p className="text-xs text-primary mb-1">#{i + 1}</p>
            <p className="text-sm font-semibold text-foreground line-clamp-2">{result.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.snippet}</p>
            <p className="text-xs text-primary/80 mt-2 truncate">{result.link}</p>
          </a>
        ))}
      </div>
    )}
  </div>
);
