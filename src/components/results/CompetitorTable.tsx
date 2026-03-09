interface Competitor {
  name: string;
  score: number;
  insight: string;
}

interface CompetitorTableProps {
  competitors: Competitor[];
  city: string;
  userName: string;
  userScore: number;
}

export const CompetitorTable = ({ competitors, city, userName, userScore }: CompetitorTableProps) => {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-2">
        <h3 className="text-xl font-bold text-foreground">How You Compare in {city}</h3>
        <p className="text-muted-foreground text-sm">
          No direct competitors found in your city — you have a first-mover advantage. Use it.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground">How You Compare in {city}</h3>
        <p className="text-sm text-muted-foreground">We found professionals in your field to benchmark against</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Score</th>
              <th className="text-left py-2 text-muted-foreground font-medium">What They're Doing</th>
            </tr>
          </thead>
          <tbody>
            {/* User row */}
            <tr className="border-b border-primary/30 bg-primary/5">
              <td className="py-3 font-semibold text-primary">{userName} (You)</td>
              <td className="py-3 text-center">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">{userScore}</span>
              </td>
              <td className="py-3 text-muted-foreground">—</td>
            </tr>
            {competitors.map((c, i) => (
              <tr key={i} className="border-b border-border">
                <td className="py-3 text-foreground">{c.name}</td>
                <td className="py-3 text-center">
                  <span className="bg-secondary text-foreground px-2 py-0.5 rounded-full text-xs font-medium">{c.score}</span>
                </td>
                <td className="py-3 text-muted-foreground text-xs">{c.insight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
