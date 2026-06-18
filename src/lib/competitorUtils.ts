export interface CompetitorRecord {
  name: string;
  score: number | string;
  insight: string;
  link?: string;
  platform?: string;
  handle?: string;
  source?: string;
}

const JUNK_COMPETITOR_NAME =
  /\b(top|best|leading|popular)\b|companies in|firms in|consulting firm|list of|directory/i;

/** Reject legacy AI listicles and article titles saved before competitor fix. */
export function isRealNamedCompetitor(competitor: CompetitorRecord | null | undefined): boolean {
  if (!competitor?.name?.trim()) return false;
  if (JUNK_COMPETITOR_NAME.test(competitor.name)) return false;
  if (typeof competitor.score === "string") return false;
  if (!Number.isFinite(Number(competitor.score))) return false;
  return true;
}

export function filterRealCompetitors<T extends CompetitorRecord>(competitors: T[]): T[] {
  return competitors.filter(isRealNamedCompetitor);
}

export function hasLegacyCompetitorData(competitors: CompetitorRecord[]): boolean {
  return competitors.some((c) => !isRealNamedCompetitor(c));
}
