import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeadersFor } from "../_shared/cors.ts";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;

const PLATFORMS = [
  { id: "instagram", label: "Instagram", buildUrl: (h: string) => `https://www.instagram.com/${h}/` },
  { id: "tiktok", label: "TikTok", buildUrl: (h: string) => `https://www.tiktok.com/@${h}` },
  { id: "x", label: "X (Twitter)", buildUrl: (h: string) => `https://x.com/${h}` },
  { id: "linkedin", label: "LinkedIn", buildUrl: (h: string) => `https://www.linkedin.com/in/${h}` },
] as const;

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface GooglePreviewItem {
  index: number;
  title: string;
  link: string;
  snippet: string;
  matchesName: boolean;
  sourceQuery: string;
}

interface VerifiedFinding {
  text: string;
  source: string;
  type: "google" | "social" | "score";
}

interface QueryRun {
  query: string;
  type: "name" | "profession" | "city" | "competitors";
  resultCount: number;
}

interface SerperResponse {
  items: SearchResult[];
  failed: boolean;
  error?: string;
}

interface SocialProfile {
  platform: string;
  label: string;
  handle: string;
  url: string;
  status: "found" | "not_found" | "blocked" | "unknown";
  title?: string;
  foundInGoogle: boolean;
  discoverabilityGap: boolean;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function generateToken(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (const byte of arr) result += chars[byte % chars.length];
  return result;
}

function getTier(score: number): string {
  if (score <= 20) return "Ghost";
  if (score <= 40) return "Shadow";
  if (score <= 60) return "Emerging";
  if (score <= 80) return "Visible";
  return "Authority";
}

function sanitize(s: string): string {
  return s.replace(/[\x00-\x1f\x7f]/g, "").replace(/[<>]/g, "");
}

function normalizeHandle(handle: string): string {
  return handle
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(instagram\.com|tiktok\.com|x\.com|twitter\.com|linkedin\.com\/in)\/?/i, "")
    .replace(/\/$/, "")
    .split(/[/?#]/)[0]
    .slice(0, 80);
}

async function serperSearch(query: string, apiKey: string): Promise<SerperResponse> {
  try {
    const resp = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 10 }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`Serper search failed for "${query}":`, resp.status, errorText);
      return { items: [], failed: true, error: `${resp.status}: ${errorText.slice(0, 200)}` };
    }

    const data = await resp.json();
    const organic = data.organic || [];
    return {
      items: organic.map((item: { title?: string; link?: string; snippet?: string }) => ({
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
      })),
      failed: false,
    };
  } catch (error) {
    console.error(`Serper request failed for "${query}":`, error);
    return { items: [], failed: true, error: "Network error calling Serper API" };
  }
}

async function checkProfile(url: string): Promise<{ status: SocialProfile["status"]; title?: string }> {
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VisibilityAudit/1.0)",
        Accept: "text/html",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    const html = (await resp.text()).slice(0, 8000);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch?.[1]?.replace(/\s+/g, " ").trim();
    const lower = html.toLowerCase();

    if (resp.status === 404) return { status: "not_found", title };
    if (lower.includes("page not found") || lower.includes("page isn't available") || lower.includes("this account doesn't exist")) {
      return { status: "not_found", title };
    }
    if (
      (lower.includes("log in") || lower.includes("sign up")) &&
      (lower.includes("instagram") || lower.includes("linkedin") || lower.includes("facebook"))
    ) {
      return { status: "blocked", title: title || "Profile may exist but is not publicly readable" };
    }
    if (resp.status >= 200 && resp.status < 400) {
      return { status: "found", title };
    }
    return { status: "unknown", title };
  } catch {
    return { status: "unknown" };
  }
}

function urlMatchesPlatform(url: string, platformId: string, handle: string): boolean {
  const lower = url.toLowerCase();
  const h = handle.toLowerCase();
  if (!h) return false;
  switch (platformId) {
    case "instagram":
      return lower.includes("instagram.com") && lower.includes(h);
    case "tiktok":
      return lower.includes("tiktok.com") && lower.includes(h);
    case "x":
      return (lower.includes("x.com") || lower.includes("twitter.com")) && lower.includes(h);
    case "linkedin":
      return lower.includes("linkedin.com") && lower.includes(h);
    default:
      return false;
  }
}

async function auditSocialProfiles(
  handles: Record<string, string>,
  allResults: SearchResult[],
): Promise<SocialProfile[]> {
  const profiles: SocialProfile[] = [];

  for (const platform of PLATFORMS) {
    const handle = handles[platform.id];
    if (!handle) continue;

    const url = platform.buildUrl(handle);
    const check = await checkProfile(url);
    const foundInGoogle = allResults.some((r) => urlMatchesPlatform(r.link, platform.id, handle));

    profiles.push({
      platform: platform.id,
      label: platform.label,
      handle,
      url,
      status: check.status,
      title: check.title,
      foundInGoogle,
      discoverabilityGap: (check.status === "found" || check.status === "blocked") && !foundInGoogle,
    });
  }

  return profiles;
}

function getNameTokens(fullName: string): string[] {
  return fullName.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
}

function resultMatchesName(result: SearchResult, fullName: string): boolean {
  const text = `${result.title} ${result.snippet}`.toLowerCase();
  const fullLower = fullName.toLowerCase().trim();
  if (fullLower && text.includes(fullLower)) return true;

  const tokens = getNameTokens(fullName);
  if (tokens.length === 0) return false;
  const matched = tokens.filter((t) => text.includes(t));
  if (tokens.length === 1) return matched.length >= 1;
  if (matched.length >= 2) return true;
  const lastName = tokens[tokens.length - 1];
  return lastName.length >= 4 && matched.includes(lastName);
}

function dedupeByLink(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.link.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildGooglePreview(
  personSearches: SerperResponse[],
  queries: string[],
): GooglePreviewItem[] {
  const items: GooglePreviewItem[] = [];
  const seen = new Set<string>();

  for (let q = 0; q < personSearches.length; q++) {
    for (const result of personSearches[q].items) {
      const key = result.link.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push({
        index: items.length + 1,
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        matchesName: false,
        sourceQuery: queries[q],
      });
    }
  }

  return items.slice(0, 8);
}

function detectPlatformsInResults(results: SearchResult[]): string[] {
  const platforms: string[] = [];
  const urls = results.map((r) => r.link.toLowerCase()).join(" ");
  if (urls.includes("linkedin.com")) platforms.push("LinkedIn");
  if (urls.includes("instagram.com")) platforms.push("Instagram");
  if (urls.includes("tiktok.com")) platforms.push("TikTok");
  if (urls.includes("twitter.com") || urls.includes("x.com")) platforms.push("X");
  if (urls.includes("facebook.com")) platforms.push("Facebook");
  if (urls.includes("youtube.com")) platforms.push("YouTube");
  return platforms;
}

function buildVerifiedFindings(
  googlePreview: GooglePreviewItem[],
  socialProfiles: SocialProfile[],
  allPersonResults: SearchResult[],
  fullName: string,
): VerifiedFinding[] {
  const findings: VerifiedFinding[] = [];
  const matching = googlePreview.filter((r) => resultMatchesName(r, fullName));
  for (const r of googlePreview) r.matchesName = resultMatchesName(r, fullName);

  if (matching.length > 0) {
    findings.push({
      text: `${matching.length} Google result${matching.length > 1 ? "s" : ""} mention your name`,
      source: `Results #${matching.map((r) => r.index).join(", #")}`,
      type: "google",
    });
  } else if (googlePreview.length > 0) {
    findings.push({
      text: "Google returned results for your name, but none clearly match you",
      source: `Searched ${googlePreview.length} unique links`,
      type: "google",
    });
  } else {
    findings.push({
      text: "No Google results found for your name",
      source: "Name search query",
      type: "google",
    });
  }

  const platforms = detectPlatformsInResults(allPersonResults);
  if (platforms.length > 0) {
    findings.push({
      text: `Platforms found in Google: ${platforms.join(", ")}`,
      source: "Verified from result links",
      type: "google",
    });
  }

  for (const profile of socialProfiles) {
    if (profile.status === "found" || profile.status === "blocked") {
      findings.push({
        text: profile.foundInGoogle
          ? `${profile.label} (@${profile.handle}) exists and appears in Google`
          : `${profile.label} (@${profile.handle}) exists but is NOT in Google name results`,
        source: profile.foundInGoogle ? "Profile URL + Google results" : "Profile URL check",
        type: "social",
      });
    } else if (profile.status === "not_found") {
      findings.push({
        text: `No public ${profile.label} profile found for @${profile.handle}`,
        source: `Checked ${profile.url}`,
        type: "social",
      });
    }
  }

  return findings;
}

function buildBreakdownExplanations(
  breakdown: Record<string, number>,
  allPersonResults: SearchResult[],
  socialProfiles: SocialProfile[],
  fullName: string,
): Record<string, string> {
  const matchingCount = allPersonResults.filter((r) => resultMatchesName(r, fullName)).length;
  const platforms = detectPlatformsInResults(allPersonResults);
  const socialScore = breakdown.social_presence;

  let googleExplain = `${matchingCount} results match your name`;
  if (breakdown.google_results >= 20) googleExplain += ". Strong visibility.";
  else if (breakdown.google_results >= 10) googleExplain += ". Moderate visibility.";
  else if (breakdown.google_results > 0) googleExplain += ". Weak visibility.";
  else googleExplain += ". No clear matches.";

  let socialExplain = platforms.length > 0
    ? `Found ${platforms.join(", ")} in Google`
  : "No major social platforms in Google results";
  if (socialProfiles.some((p) => p.discoverabilityGap)) {
    socialExplain += "; some profiles exist but aren't discoverable via Google";
  } else if (socialScore >= 18) {
    socialExplain += "; good cross-platform presence";
  }

  const contentIndicators = ["article", "blog", "post", "interview", "podcast", "published", "featured", "media"];
  const contentCount = allPersonResults.filter((r) => {
    const text = `${r.title} ${r.snippet}`.toLowerCase();
    return contentIndicators.some((ind) => text.includes(ind));
  }).length;

  return {
    google_results: googleExplain,
    social_presence: socialExplain,
    content_footprint: contentCount > 0
      ? `${contentCount} result${contentCount > 1 ? "s" : ""} suggest published content`
      : "No articles, interviews, or thought-leadership content found",
    brand_clarity: matchingCount >= 3
      ? "Multiple consistent results about you"
      : matchingCount >= 1
      ? "Some results match, but messaging is inconsistent"
      : "No clear personal brand in search results",
  };
}

interface CompetitorRecord {
  name: string;
  score: number;
  insight: string;
  link: string;
  platform?: string;
  handle?: string;
  source: "google";
}

const JUNK_COMPETITOR_PATTERNS = [
  /\d+\s+(best|top)/i,
  /best\s+\d+/i,
  /top\s+\d+/i,
  /\btop\b/i,
  /\bbest\b/i,
  /\bleading\b/i,
  /wikipedia/i,
  /indeed\.com/i,
  /glassdoor/i,
  /yellow\s*pages/i,
  /directory/i,
  /job\s*vacanc/i,
  /\bhiring\b/i,
  /how to become/i,
  /what is a/i,
  /\bsalary\b/i,
  /courses?\./i,
  /certification/i,
  /\b(companies|company|firms|firm|agencies|agency|consulting firms?)\b/i,
  /\blist of\b/i,
  /clutch\.co/i,
  /sortlist/i,
  /goodfirms/i,
];

const COMPANY_TITLE_WORDS = /\b(companies|company|firms|firm|agencies|agency|services|solutions|consulting|list of|directory)\b/i;

function isPersonalProfileUrl(link: string): boolean {
  const lower = link.toLowerCase();
  if (lower.includes("linkedin.com/in/")) return true;
  if (/instagram\.com\/[^/]+\/?$/.test(lower)) return true;
  if (/twitter\.com\/[^/]+\/?$/.test(lower) || /x\.com\/[^/]+\/?$/.test(lower)) return true;
  if (/facebook\.com\/[^/]+\/?$/.test(lower) && !lower.includes("/groups/")) return true;
  if (lower.includes("tiktok.com/@")) return true;
  if (lower.includes("youtube.com/@") || lower.includes("youtube.com/c/") || lower.includes("youtube.com/channel/")) return true;
  return false;
}

function looksLikePersonName(name: string): boolean {
  if (!name || COMPANY_TITLE_WORDS.test(name)) return false;
  if (/\btop\b|\bbest\b|\bleading\b|\bpopular\b|\d/.test(name)) return false;
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
  return words.every((w) => /^[A-Za-z'.-]{2,}$/.test(w));
}

function isLikelyPersonCompetitor(result: SearchResult, fullName: string): boolean {
  const title = result.title.toLowerCase();
  const link = result.link.toLowerCase();
  if (JUNK_COMPETITOR_PATTERNS.some((p) => p.test(title) || p.test(link))) return false;
  if (resultMatchesName(result, fullName)) return false;
  if (!result.title.trim() || !result.link.trim()) return false;

  const personalUrl = isPersonalProfileUrl(link);
  if (!personalUrl) return false;

  const name = parseCompetitorName(result);
  return looksLikePersonName(name) || link.includes("linkedin.com/in/");
}

function extractLinkMeta(link: string): { platform?: string; handle?: string } {
  try {
    const url = new URL(link);
    const lower = link.toLowerCase();
    const pathParts = url.pathname.replace(/\/$/, "").split("/").filter(Boolean);

    if (lower.includes("instagram.com") && pathParts[0]) {
      return { platform: "Instagram", handle: `@${pathParts[0]}` };
    }
    if (lower.includes("linkedin.com/in/") && pathParts[1]) {
      return { platform: "LinkedIn", handle: pathParts[1] };
    }
    if (lower.includes("tiktok.com") && pathParts[0]?.startsWith("@")) {
      return { platform: "TikTok", handle: pathParts[0] };
    }
    if ((lower.includes("x.com") || lower.includes("twitter.com")) && pathParts[0]) {
      return { platform: "X", handle: `@${pathParts[0]}` };
    }
    if (lower.includes("facebook.com") && pathParts[0]) {
      return { platform: "Facebook", handle: pathParts[0] };
    }
    if (lower.includes("youtube.com") && pathParts.length > 0) {
      const channel = pathParts[0] === "channel" ? pathParts[1] : pathParts[0];
      return { platform: "YouTube", handle: channel };
    }
    return { platform: "Website", handle: url.hostname.replace("www.", "") };
  } catch {
    return {};
  }
}

function parseCompetitorName(result: SearchResult): string {
  const meta = extractLinkMeta(result.link);
  if (meta.platform === "LinkedIn" && meta.handle) {
    return meta.handle
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  let name = result.title.split(" - ")[0].split(" | ")[0].split(" — ")[0].trim();
  name = name.replace(/^(dr\.?|mr\.?|mrs\.?|prof\.?)\s+/i, "");
  name = name.replace(/\s+on\s+(LinkedIn|Instagram|Facebook|Twitter|X|TikTok|YouTube).*$/i, "");
  name = name.replace(/\s*[(@|].*$/, "").trim();
  if (name.length > 55) name = name.slice(0, 55).trim();
  return name || meta.handle || "Professional";
}

function buildCompetitorsFromSearch(
  compResults: SearchResult[],
  fullName: string,
  userScore: number,
): CompetitorRecord[] {
  const seen = new Set<string>();
  const competitors: CompetitorRecord[] = [];

  for (const result of compResults) {
    if (!isLikelyPersonCompetitor(result, fullName)) continue;

    const name = parseCompetitorName(result);
    const nameKey = name.toLowerCase();
    const linkKey = result.link.toLowerCase();
    if (seen.has(nameKey) || seen.has(linkKey)) continue;
    seen.add(nameKey);
    seen.add(linkKey);

    const meta = extractLinkMeta(result.link);
    const rank = competitors.length;
    competitors.push({
      name,
      score: Math.min(95, Math.max(userScore + 5, 50) + Math.max(0, 15 - rank * 3)),
      insight: result.snippet?.slice(0, 200) || "Visible in your market on Google",
      link: result.link,
      platform: meta.platform,
      handle: meta.handle,
      source: "google",
    });

    if (competitors.length >= 6) break;
  }

  return competitors;
}

async function discoverCompetitors(
  initialResults: SearchResult[],
  fullName: string,
  userScore: number,
  safeProfession: string,
  safeCity: string,
  safeCountry: string,
  serperKey: string,
): Promise<{ competitors: CompetitorRecord[]; extraQueries: string[] }> {
  let competitors = buildCompetitorsFromSearch(initialResults, fullName, userScore);
  const extraQueries: string[] = [];

  if (competitors.length >= 3) {
    return { competitors, extraQueries };
  }

  const fallbackQueries = [
    `${safeProfession} ${safeCity} site:linkedin.com/in`,
    `${safeProfession} ${safeCountry} site:linkedin.com/in`,
    `${safeProfession} ${safeCity} ${safeCountry} instagram`,
  ];

  for (const query of fallbackQueries) {
    if (competitors.length >= 5) break;
    extraQueries.push(query);
    const search = await serperSearch(query, serperKey);
    const merged = dedupeByLink([...initialResults, ...search.items]);
    competitors = buildCompetitorsFromSearch(merged, fullName, userScore);
  }

  return { competitors, extraQueries };
}

function enrichCompetitorsWithAi(
  searchCompetitors: CompetitorRecord[],
  aiCompetitors: unknown,
): CompetitorRecord[] {
  return searchCompetitors;
}

function computeQuickWin(
  score: number,
  breakdown: Record<string, number>,
  gaps: string[],
  socialProfiles: SocialProfile[],
  firstName: string,
  profession: string,
  city: string,
  country: string,
): string {
  const lowestKey = (Object.entries(breakdown).sort((a, b) => a[1] - b[1])[0] || ["", 0])[0];

  if (score >= 80) {
    if (lowestKey === "content_footprint") {
      return `You should publish one in-depth ${profession} story from ${country} on LinkedIn. You're already visible; now cement your authority with long-form content.`;
    }
    if (lowestKey === "brand_clarity") {
      return `You should unify every bio to one line: "${profession} helping clients in ${city}". You're findable; now make your message identical everywhere.`;
    }
    return `You should pitch one ${country} podcast or media outlet with a bold ${profession} take. You've outgrown basic profile setup.`;
  }

  if (score >= 60) {
    const gapProfile = socialProfiles.find((p) => p.discoverabilityGap);
    if (gapProfile) {
      return `You should optimise your ${gapProfile.label} (@${gapProfile.handle}) so it ranks when people search "${firstName}". The profile exists but Google hides it.`;
    }
    return `You should turn your best client result in ${city} into a named LinkedIn case study this week. You're visible; now show proof.`;
  }

  if (socialProfiles.some((p) => p.status === "not_found" || p.status === "unknown")) {
    return `You should set up and complete your LinkedIn profile with headline "${profession} | ${city}, ${country}". It's your fastest win right now.`;
  }

  if (gaps.includes("Low Google search visibility")) {
    return `You should create one Google-indexable page (LinkedIn featured section or simple site) titled "${firstName}, ${profession} in ${city}".`;
  }

  return `You should post one ${profession} tip tied to ${city} on LinkedIn and Instagram this week. Start building what Google can find about you.`;
}

function scoreGoogleResults(results: SearchResult[], fullName: string): number {
  if (results.length === 0) return 0;
  const topResults = results.slice(0, 5);
  const nameInTop5 = topResults.filter((r) => resultMatchesName(r, fullName)).length;
  const nameInTop3 = topResults.slice(0, 3).filter((r) => resultMatchesName(r, fullName)).length;
  const platforms = detectPlatformsInResults(topResults);

  if (nameInTop3 >= 2 || (nameInTop3 >= 1 && platforms.length >= 2)) return 25;
  if (nameInTop5 >= 2 || nameInTop3 >= 1) return 18;
  if (nameInTop5 >= 1 || platforms.length >= 2) return 12;
  if (results.length >= 1) return 5;
  return 0;
}

function scoreSocialPresence(allResults: SearchResult[], socialProfiles: SocialProfile[]): number {
  const urls = allResults.map((r) => r.link.toLowerCase());
  const hasLinkedIn = urls.some((u) => u.includes("linkedin.com")) ||
    socialProfiles.some((p) => p.platform === "linkedin" && p.status === "found");
  const hasInstagram = urls.some((u) => u.includes("instagram.com")) ||
    socialProfiles.some((p) => p.platform === "instagram" && p.status === "found");
  const hasTikTok = urls.some((u) => u.includes("tiktok.com")) ||
    socialProfiles.some((p) => p.platform === "tiktok" && p.status === "found");
  const hasX = urls.some((u) => u.includes("twitter.com") || u.includes("x.com")) ||
    socialProfiles.some((p) => p.platform === "x" && p.status === "found");

  const platformCount = [hasLinkedIn, hasInstagram, hasTikTok, hasX].filter(Boolean).length;
  const discoverableCount = socialProfiles.filter((p) => p.foundInGoogle).length +
    [hasLinkedIn, hasInstagram, hasTikTok, hasX].filter((has, i) => {
      const ids = ["linkedin", "instagram", "tiktok", "x"];
      return has && allResults.some((r) => urlMatchesPlatform(r.link, ids[i], socialProfiles.find((p) => p.platform === ids[i])?.handle || ""));
    }).length;

  if (platformCount >= 3 && discoverableCount >= 2) return 25;
  if (platformCount >= 2) return 18;
  if (hasLinkedIn || hasInstagram) return 12;
  if (platformCount >= 1) return 6;
  return 0;
}

function scoreContentFootprint(allResults: SearchResult[]): number {
  const contentIndicators = ["article", "blog", "post", "interview", "podcast", "webinar", "published", "authored", "wrote", "featured", "media", "press"];
  let contentCount = 0;
  for (const r of allResults) {
    const text = (r.title + " " + r.snippet).toLowerCase();
    if (contentIndicators.some((ind) => text.includes(ind))) contentCount++;
  }
  if (contentCount >= 5) return 25;
  if (contentCount >= 3) return 16;
  if (contentCount >= 1) return 8;
  return 0;
}

function scoreBrandClarity(nameResults: SearchResult[], fullName: string): number {
  if (nameResults.length === 0) return 0;
  const topResult = nameResults[0];
  const topIsAboutUser = resultMatchesName(topResult, fullName);
  const consistentResults = nameResults.filter((r) => resultMatchesName(r, fullName)).length;

  if (topIsAboutUser && consistentResults >= 4) return 25;
  if (topIsAboutUser && consistentResults >= 2) return 18;
  if (consistentResults >= 1) return 10;
  if (nameResults.length >= 3) return 4;
  return 0;
}

function parseAiJson(content: string): Record<string, unknown> {
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    return JSON.parse(jsonMatch[1].trim());
  } catch {
    return {};
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function thirdToSecondPerson(text: string): string {
  return text
    .replace(/\b(he|she)\s+has\b/gi, "you have")
    .replace(/\b(he|she)\s+is\b/gi, "you are")
    .replace(/\b(his|her)\s+/gi, "your ")
    .replace(/\bhe's\b/gi, "you're")
    .replace(/\bshe's\b/gi, "you're");
}

function rewritePassivePhrasing(text: string): string {
  return text
    .replace(/based on the available data,?\s*it is estimated that\s*/gi, "")
    .replace(/it is estimated that\s*/gi, "")
    .trim();
}

function replaceSubjectNameWithYou(text: string, firstName: string, fullName: string): string {
  let result = text;
  const names = [fullName, firstName]
    .filter((n) => n.trim().length > 1)
    .sort((a, b) => b.length - a.length);

  for (const name of names) {
    const esc = escapeRegex(name);
    result = result.replace(new RegExp(`\\b${esc}\\s+is\\b`, "gi"), "You are");
    result = result.replace(new RegExp(`\\b${esc}\\s+has\\b`, "gi"), "You have");
    result = result.replace(new RegExp(`\\b${esc}\\s+was\\b`, "gi"), "You were");
    result = result.replace(new RegExp(`\\b${esc}\\b`, "gi"), "you");
  }
  return result;
}

function fixYouVerbAgreement(text: string): string {
  return text
    .replace(/\bYou is\b/g, "You are")
    .replace(/\byou is\b/g, "you are")
    .replace(/\bYou has\b/g, "You have")
    .replace(/\byou has\b/g, "you have")
    .replace(/\bYou was\b/g, "You were")
    .replace(/\byou was\b/g, "you were");
}

function replaceLongDashes(text: string): string {
  return text
    .replace(/\s*—\s*/g, ". ")
    .replace(/(\d)\s*–\s*(\d)/g, "$1 to $2")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\.\s+\./g, ".")
    .trim();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Collapse Gmail/Yahoo aliases so +tag and dot tricks cannot bypass rate limits. */
function canonicalEmail(email: string): string {
  const parsed = parseEmailParts(normalizeEmail(email));
  if (!parsed) return normalizeEmail(email);

  let { local, domain } = parsed;
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") {
    local = local.split("+")[0].replace(/\./g, "");
  } else if (domain === "ymail.com" || domain === "rocketmail.com" || domain.startsWith("yahoo.")) {
    local = local.split("+")[0];
  }
  return `${local}@${domain}`;
}

const SUSPICIOUS_LOCAL_PARTS = new Set([
  "test", "fake", "spam", "noreply", "no-reply", "admin", "asdf", "qwerty",
  "abc", "null", "undefined", "example", "user", "email",
]);

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
  "throwaway.email", "yopmail.com", "sharklasers.com", "trashmail.com",
]);

function parseEmailParts(email: string): { local: string; domain: string } | null {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return null;
  const match = trimmed.match(/^([^\s@]+)@([^\s@]+\.[^\s@]{2,})$/);
  if (!match) return null;
  return { local: match[1].toLowerCase(), domain: match[2].toLowerCase() };
}

function isAllowedEmailProvider(domain: string): boolean {
  const d = domain.toLowerCase();
  if (d === "gmail.com" || d === "googlemail.com") return true;
  if (d === "ymail.com" || d === "rocketmail.com") return true;
  if (d === "yahoo.com" || d.startsWith("yahoo.")) return true;
  return false;
}

function hasSuspiciousLocalPart(local: string): boolean {
  if (local.length < 2) return true;
  if (/^\d+$/.test(local)) return true;
  if (/^(.)\1{4,}$/.test(local)) return true;
  const base = local.split("+")[0];
  if (SUSPICIOUS_LOCAL_PARTS.has(base)) return true;
  if (/^(test|fake|spam|temp|demo|null)\d*$/i.test(base)) return true;
  return false;
}

function validateAuditEmail(email: string): string | null {
  const parsed = parseEmailParts(email);
  if (!parsed) return "Please enter a valid email address.";

  const { local, domain } = parsed;

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return "Disposable email addresses are not allowed.";
  }

  if (!isAllowedEmailProvider(domain)) {
    return "Please use a Gmail or Yahoo email address (e.g. you@gmail.com or you@yahoo.com).";
  }

  if (hasSuspiciousLocalPart(local)) {
    return "Please use your real email address.";
  }

  return null;
}

function parseFromAddress(fromEmail: string, fromName: string): { address: string; name: string } {
  const match = fromEmail.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), address: match[2].trim() };
  }
  return { address: fromEmail.trim(), name: fromName };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendAuditReportEmail(params: {
  zeptoApiKey: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  firstName: string;
  score: number;
  tier: string;
  reportUrl: string;
}): Promise<boolean> {
  const { zeptoApiKey, fromEmail, fromName, toEmail, firstName, score, tier, reportUrl } = params;
  const safeFirst = escapeHtml(firstName);
  const safeTier = escapeHtml(tier);
  const safeReportUrl = escapeHtml(reportUrl);
  const subject = `${firstName}, your AuditME score is ${score}/100 (${tier})`;
  const from = parseFromAddress(fromEmail, fromName);

  const htmlbody = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0D1B2A;color:#ffffff;padding:32px;border-radius:12px;">
      <p style="color:#4ADE80;font-weight:700;font-size:14px;margin:0 0 8px;">AuditME</p>
      <h1 style="margin:0 0 16px;font-size:24px;">Hi ${safeFirst}, your Google presence report is ready</h1>
      <p style="color:rgba(255,255,255,0.85);line-height:1.6;">
        You scored <strong style="color:#4ADE80;">${score}/100</strong> and you're currently rated as a
        <strong style="color:#4ADE80;">${safeTier}</strong> online.
      </p>
      <p style="color:rgba(255,255,255,0.85);line-height:1.6;">
        Your full report includes your score breakdown, named competitors, and a personalised action plan.
      </p>
      <p style="margin:28px 0;">
        <a href="${safeReportUrl}" style="background:#4ADE80;color:#0D1B2A;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:8px;display:inline-block;">
          View my full report
        </a>
      </p>
      <p style="color:rgba(255,255,255,0.55);font-size:12px;line-height:1.5;">
        If the button doesn't work, copy this link:<br/>
        <a href="${safeReportUrl}" style="color:#4ADE80;">${safeReportUrl}</a>
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Zoho-enczapikey ${zeptoApiKey}`,
      },
      body: JSON.stringify({
        from: { address: from.address, name: from.name },
        to: [{ email_address: { address: toEmail, name: firstName } }],
        subject,
        htmlbody,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ZeptoMail email failed:", response.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("ZeptoMail email error:", err);
    return false;
  }
}

function polishAiText(text: string, firstName: string, fullName: string): string {
  let result = text.trim().replace(/^you should\s+/i, "");
  if (!result) return result;

  const fn = escapeRegex(firstName);
  const full = escapeRegex(fullName);
  result = result.replace(new RegExp(`^${fn}\\s*,\\s*${full}\\b`, "i"), "You");
  result = rewritePassivePhrasing(result);
  result = replaceSubjectNameWithYou(result, firstName, fullName);
  result = thirdToSecondPerson(result);
  result = fixYouVerbAgreement(result);
  result = replaceLongDashes(result);

  return result.charAt(0).toUpperCase() + result.slice(1);
}

function polishSourcedClaim(claim: string, firstName: string, fullName: string): string {
  return polishAiText(claim, firstName, fullName);
}

serve(async (req) => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",").at(-1)?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute before trying again." }), {
      status: 429,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SERPER_API_KEY || !GROQ_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables:", {
        SERPER_API_KEY: !!SERPER_API_KEY,
        GROQ_API_KEY: !!GROQ_API_KEY,
        SUPABASE_URL: !!SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      throw new Error("Audit service is temporarily unavailable. Please try again later.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    const full_name = String(body.full_name || "").trim().slice(0, 100);
    const email = normalizeEmail(String(body.email || ""));
    const honeypot = String(body._hp_website || "").trim();
    const profession = String(body.profession || "").trim().slice(0, 100);
    const country = String(body.country || "").trim().slice(0, 100);
    const city = String(body.city || "").trim().slice(0, 100);

    if (honeypot) {
      return new Response(JSON.stringify({ error: "Unable to process your request." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!full_name || !email || !profession || !country || !city) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const emailError = validateAuditEmail(email);
    if (emailError) {
      return new Response(JSON.stringify({ error: emailError }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const emailKey = canonicalEmail(email);
    const { data: recentEmails, error: rateLimitError } = await supabase
      .from("audits")
      .select("email")
      .gte("created_at", oneDayAgo)
      .limit(500);

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    } else if (recentEmails?.some((row) => canonicalEmail(String(row.email || "")) === emailKey)) {
      return new Response(JSON.stringify({
        error: "You already ran an audit in the last 24 hours. Check your inbox for your report link.",
      }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const mainHandle = normalizeHandle(String(body.social_handle || ""));
    const handles = {
      instagram: normalizeHandle(String(body.instagram_handle || mainHandle)),
      tiktok: normalizeHandle(String(body.tiktok_handle || mainHandle)),
      x: normalizeHandle(String(body.x_handle || mainHandle)),
      linkedin: normalizeHandle(String(body.linkedin_handle || mainHandle)),
    };

    const safeName = sanitize(full_name);
    const safeProfession = sanitize(profession);
    const safeCity = sanitize(city);
    const safeCountry = sanitize(country);

    const personQueries = [
      safeName,
      `${safeName} ${safeProfession}`,
      `${safeName} ${safeCity}`,
    ];
    const competitorQueries = [
      `site:linkedin.com/in ${safeProfession} ${safeCountry}`,
      `${safeProfession} ${safeCity} ${safeCountry} linkedin`,
      `site:instagram.com ${safeProfession} ${safeCountry}`,
    ];

    const personQueryLabels: QueryRun["type"][] = ["name", "profession", "city"];
    const queriesRun: QueryRun[] = personQueries.map((query, i) => ({
      query,
      type: personQueryLabels[i],
      resultCount: 0,
    }));
    competitorQueries.forEach((query) => {
      queriesRun.push({ query, type: "competitors", resultCount: 0 });
    });

    const [personSearches, ...competitorSearches] = await Promise.all([
      Promise.all(personQueries.map((q) => serperSearch(q, SERPER_API_KEY))),
      ...competitorQueries.map((q) => serperSearch(q, SERPER_API_KEY)),
    ]);

    personSearches.forEach((search, i) => {
      queriesRun[i].resultCount = search.items.length;
    });
    competitorSearches.forEach((search, i) => {
      queriesRun[personQueries.length + i].resultCount = search.items.length;
    });

    const allSearches = [...personSearches, ...competitorSearches];
    if (allSearches.every((result) => result.failed)) {
      const firstError = allSearches.find((result) => result.error)?.error || "unknown error";
      console.error("All Serper searches failed:", firstError);
      throw new Error(
        "Search is not configured correctly. Add SERPER_API_KEY in Supabase Edge Function secrets.",
      );
    }

    const allPersonResults = dedupeByLink(personSearches.flatMap((r) => r.items));
    const compResults = dedupeByLink(competitorSearches.flatMap((r) => r.items));
    const competitorQuery = competitorQueries.join(" · ");
    const googlePreview = buildGooglePreview(personSearches, personQueries);
    const searchedAt = new Date().toISOString();

    const socialProfiles = await auditSocialProfiles(handles, allPersonResults);

    const breakdown = {
      google_results: scoreGoogleResults(allPersonResults, full_name),
      social_presence: scoreSocialPresence(allPersonResults, socialProfiles),
      content_footprint: scoreContentFootprint(allPersonResults),
      brand_clarity: scoreBrandClarity(allPersonResults, full_name),
    };
    const breakdownExplanations = buildBreakdownExplanations(
      breakdown,
      allPersonResults,
      socialProfiles,
      full_name,
    );
    const verifiedFindings = buildVerifiedFindings(
      googlePreview,
      socialProfiles,
      allPersonResults,
      full_name,
    );
    const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const tier = getTier(score);

    const competitorsFromSearch = (
      await discoverCompetitors(
        compResults,
        full_name,
        score,
        safeProfession,
        safeCity,
        safeCountry,
        SERPER_API_KEY,
      )
    ).competitors;
    const competitorsForAi = competitorsFromSearch.map((c, i) =>
      `#${i + 1} ${c.name} | ${c.platform || "Web"} ${c.handle || ""} | ${c.link} | ${c.insight}`
    ).join("\n");

    const gaps: string[] = [];
    if (breakdown.google_results < 15) gaps.push("Low Google search visibility");
    if (breakdown.social_presence < 16) gaps.push("Weak or undiscoverable social media presence");
    if (breakdown.content_footprint < 16) gaps.push("Little to no thought leadership content");
    if (breakdown.brand_clarity < 16) gaps.push("Inconsistent or unclear professional brand");
    if (socialProfiles.some((p) => p.discoverabilityGap)) {
      gaps.push("Social profiles exist but don't show up when people search your name");
    }

    const googlePreviewForAi = googlePreview.slice(0, 5);
    const firstName = safeName.split(" ")[0];

    const socialSummary = socialProfiles.length > 0
      ? socialProfiles.map((p) =>
        `${p.label} (@${p.handle}): ${p.status}, Google visibility: ${p.foundInGoogle ? "yes" : "no"}`
      ).join("\n")
      : "No social handles provided";

    const computedQuickWin = computeQuickWin(
      score, breakdown, gaps, socialProfiles, firstName, safeProfession, safeCity, safeCountry,
    );

    const highScoreRules = score >= 80
      ? `CRITICAL: Score is ${score}/100 (${tier}). User ALREADY has strong visibility. NEVER suggest claiming profiles, setting up basic social media, or "increasing visibility" from scratch. Focus on authority, media, and content depth.`
      : score >= 60
      ? `User has moderate-strong visibility (${score}/100). Do not suggest basic profile setup. Suggest specific growth tactics.`
      : "";

    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            `You are a senior visibility coach speaking DIRECTLY to African professionals in a 1:1 consultation. Always use second person ("you", "your"), never third person ("he", "she", "they have"). Sound warm, confident, and specific like an expert who has reviewed their audit. Ban generic tips unless you name a platform, city, competitor, or concrete action. Never use em dashes in your output. Respond only in valid JSON.`,
        },
        {
          role: "user",
          content: `Create a personalised visibility plan speaking DIRECTLY to ${firstName}. Every sentence should feel like you are in the room telling them what to do.

Name: <user_input>${safeName}</user_input>
Profession: <user_input>${safeProfession}</user_input>
City: <user_input>${safeCity}</user_input>
Country: <user_input>${safeCountry}</user_input>
Score: ${score}/100 (${tier})
Gaps: ${gaps.join(", ") || "None"}

Verified Google results for them:
${googlePreviewForAi.map((r) => `#${r.index} ${r.title}: ${r.snippet}`).join("\n") || "None"}

Verified competitors from Google (USE THESE NAMES; do not invent competitors):
${competitorsForAi || "None found"}

Social audit:
${socialSummary}

${highScoreRules}

Pre-computed quick win (use this exact text for biggest_quick_win field):
"${computedQuickWin}"

VOICE RULES (STRICT; violations make the output unusable):
- NEVER write "${safeName} has" or "${firstName} has". Always use "You have" or "Your profile shows"
- NEVER use he/she/his/her when referring to the person. Only use "you" and "your"
- NEVER repeat their name at the start of a sentence if you already address them (bad: "${firstName}, ${safeName} has...". Good: "You have...")
- interpretation_summary MUST start with: "Here's what stands out about your presence:" then 2-3 sentences using only "you/your"
- discovery_estimate MUST use "you/your" throughout. Tell them how strangers perceive THEM
- sourced_claims: each claim is a fact about the reader. Start with "You have", "Your", or "You're listed on"
- action_plan items MUST start with "You should..." or a direct imperative
- competitor_themes: tell them what to learn from named competitors using "you should"
- NEVER use em dashes (—) anywhere in the JSON output

CONTENT RULES:
- action_plan items must be specific (e.g. "You should turn your ${safeCity} client win into a LinkedIn carousel" NOT "post more content")
- first_5_posts titles must include "${firstName}" OR "${safeCity}" OR "${safeProfession}"
- competitor_themes must name at least 2 competitors from the list above
- Do NOT return a competitors array. Competitors are already verified separately

Return JSON:
{
  "action_plan": {
    "week_1": [ 4-5 actions starting with "You should..." for ${firstName} ],
    "month_1": [ 4-5 actions ],
    "month_3": [ 4-5 actions ]
  },
  "content_blueprint": {
    "content_types": [ 3 objects: { "type", "example_headline" (must mention ${firstName} or ${safeCity}), "platform", "frequency" } ],
    "competitor_themes": [ 3 strings telling ${firstName} what named competitors post and what to do about it ],
    "first_5_posts": [ 5 objects: { "title", "platform", "hook_line" } ]
  },
  "sourced_claims": [ 3-5 objects: { "claim" (use "You..."), "source" } ],
  "interpretation_summary": "Start with 'Here's what stands out about your presence:' then 2-3 sentences. Example tone: 'You already have X. What you're missing is Y. I'd focus on Z this week.'",
  "discovery_estimate": "2 sentences max. Example: 'You're scoring 76/100. People can find you, but you don't yet look like the go-to expert in Lagos. Your next move is showing proof, not just presence.'",
  "biggest_quick_win": "${computedQuickWin.replace(/"/g, '\\"')}",
  "upsell_hook": "one sentence speaking directly to ${firstName} about their specific gap"
}`,
        },
      ],
      temperature: 0.85,
      max_tokens: 3000,
    };

    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groqPayload),
    });

    if (!groqResp.ok) {
      const errorText = await groqResp.text();
      console.error("Groq API error:", groqResp.status, errorText);
      throw new Error("Audit processing failed. Please try again.");
    }

    const groqData = await groqResp.json();
    const aiContent = groqData.choices?.[0]?.message?.content || "{}";
    const aiPlan = parseAiJson(aiContent);

    const competitors = enrichCompetitorsWithAi(competitorsFromSearch, aiPlan.competitors);

    const rawClaims = Array.isArray(aiPlan.sourced_claims) ? aiPlan.sourced_claims : [];
    const positioning = {
      verified_findings: verifiedFindings,
      sourced_claims: rawClaims.map((item: { claim?: string; source?: string }) => ({
        claim: polishSourcedClaim(String(item.claim || ""), firstName, safeName),
        source: String(item.source || ""),
      })).filter((item: { claim: string }) => item.claim.trim()),
      interpretation_summary: polishAiText(
        String(aiPlan.interpretation_summary || aiPlan.diagnosis_summary || ""),
        firstName,
        safeName,
      ),
      discovery_estimate: polishAiText(
        String(aiPlan.discovery_estimate || aiPlan.ai_visibility_summary || ""),
        firstName,
        safeName,
      ),
      biggest_quick_win: computedQuickWin,
      upsell_hook: polishAiText(String(aiPlan.upsell_hook || ""), firstName, safeName),
    };

    const shareToken = generateToken(10);
    const siteUrl = (Deno.env.get("SITE_URL") || "https://auditme.app").replace(/\/$/, "");
    const reportUrl = `${siteUrl}/results/${shareToken}`;

    const { data: auditRow, error: insertError } = await supabase.from("audits").insert({
      full_name,
      email,
      profession,
      country,
      city,
      score,
      tier,
      breakdown,
      competitors,
      action_plan: aiPlan.action_plan || {},
      content_blueprint: {
        ...(typeof aiPlan.content_blueprint === "object" && aiPlan.content_blueprint ? aiPlan.content_blueprint : {}),
        positioning,
      },
      gaps,
      share_token: shareToken,
      reaudit_consented: true,
      raw_search_results: {
        googleResults: googlePreview,
        compResults: compResults.slice(0, 5),
        socialProfiles,
        handles: { main: mainHandle, ...handles },
        auditMeta: {
          searchedAt,
          queriesRun,
          competitorQuery,
          breakdownExplanations,
        },
      },
    }).select("id").single();

    if (insertError || !auditRow) {
      console.error("Supabase insert error:", insertError);
      throw new Error("Audit processing failed. Please try again.");
    }

    const reportSentAt = new Date().toISOString();
    const ZEPTOMAIL_API_KEY = Deno.env.get("ZEPTOMAIL_API_KEY");
    const ZEPTOMAIL_FROM_EMAIL = Deno.env.get("ZEPTOMAIL_FROM_EMAIL") || "reports@auditme.app";
    const ZEPTOMAIL_FROM_NAME = Deno.env.get("ZEPTOMAIL_FROM_NAME") || "AuditME";
    let emailSent = false;

    if (ZEPTOMAIL_API_KEY) {
      emailSent = await sendAuditReportEmail({
        zeptoApiKey: ZEPTOMAIL_API_KEY,
        fromEmail: ZEPTOMAIL_FROM_EMAIL,
        fromName: ZEPTOMAIL_FROM_NAME,
        toEmail: email,
        firstName,
        score,
        tier,
        reportUrl,
      });
    } else {
      console.warn("ZEPTOMAIL_API_KEY not set; skipping report email.");
    }

    const { error: leadError } = await supabase.from("leads").insert({
      audit_id: auditRow.id,
      email,
      name: full_name,
      profession,
      city,
      country,
      score,
      tier,
      source: "survey",
      follow_up_status: "new",
      report_url: reportUrl,
      report_sent_at: emailSent ? reportSentAt : null,
    });

    if (leadError) {
      console.error("Lead insert error:", leadError);
    }

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 30);
    const { error: reauditError } = await supabase.from("reaudit_queue").insert({
      audit_id: auditRow.id,
      email,
      scheduled_at: scheduledAt.toISOString(),
    });

    if (reauditError) {
      console.error("Reaudit queue error:", reauditError);
    }

    return new Response(
      JSON.stringify({
        share_token: shareToken,
        score,
        tier,
        breakdown,
        competitors,
        action_plan: aiPlan.action_plan,
        content_blueprint: aiPlan.content_blueprint,
        positioning,
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("run-audit error:", error);
    const safeMessages = [
      "Audit service is temporarily unavailable. Please try again later.",
      "Audit processing failed. Please try again.",
      "Missing required fields",
      "Too many requests. Please wait a minute before trying again.",
      "Search is not configured correctly. Add SERPER_API_KEY in Supabase Edge Function secrets.",
    ];
    const rawMessage = error instanceof Error ? error.message : "";
    const message = safeMessages.includes(rawMessage)
      ? rawMessage
      : "Something went wrong. Please try again later.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
