import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter: max 3 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;

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

function generateToken(length = 10): string {
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

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

async function googleSearch(query: string, apiKey: string, cx: string): Promise<{ totalResults: number; items: SearchResult[] }> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error(`Google search failed for "${query}":`, resp.status, await resp.text());
    return { totalResults: 0, items: [] };
  }
  const data = await resp.json();
  return {
    totalResults: parseInt(data.searchInformation?.totalResults || "0"),
    items: (data.items || []).map((item: any) => ({
      title: item.title || "",
      link: item.link || "",
      snippet: item.snippet || "",
    })),
  };
}

function scoreGoogleResults(results: SearchResult[], fullName: string): number {
  if (results.length === 0) return 0;
  const nameLower = fullName.toLowerCase();
  const topResults = results.slice(0, 3);
  const nameInTop3 = topResults.filter(r =>
    r.title.toLowerCase().includes(nameLower) || r.snippet.toLowerCase().includes(nameLower)
  ).length;
  if (nameInTop3 >= 3) return 25;
  if (nameInTop3 >= 1) return 15;
  if (results.length >= 1) return 5;
  return 0;
}

function scoreSocialPresence(allResults: SearchResult[]): number {
  const urls = allResults.map(r => r.link.toLowerCase());
  const hasLinkedIn = urls.some(u => u.includes("linkedin.com"));
  const hasTwitter = urls.some(u => u.includes("twitter.com") || u.includes("x.com"));
  const hasFacebook = urls.some(u => u.includes("facebook.com"));
  const hasInstagram = urls.some(u => u.includes("instagram.com"));
  const platformCount = [hasLinkedIn, hasTwitter, hasFacebook, hasInstagram].filter(Boolean).length;

  if (hasLinkedIn && platformCount >= 2) return 25;
  if (hasLinkedIn && platformCount >= 1) return 16;
  if (hasLinkedIn) return 8;
  if (platformCount >= 1) return 5;
  return 0;
}

function scoreContentFootprint(allResults: SearchResult[]): number {
  const contentIndicators = ["article", "blog", "post", "interview", "podcast", "webinar", "published", "authored", "wrote", "featured", "media", "press"];
  let contentCount = 0;
  for (const r of allResults) {
    const text = (r.title + " " + r.snippet).toLowerCase();
    if (contentIndicators.some(ind => text.includes(ind))) contentCount++;
  }
  if (contentCount >= 5) return 25;
  if (contentCount >= 3) return 16;
  if (contentCount >= 1) return 8;
  return 0;
}

function scoreBrandClarity(nameResults: SearchResult[], fullName: string): number {
  if (nameResults.length === 0) return 0;
  const nameLower = fullName.toLowerCase();
  const topResult = nameResults[0];
  const topIsAboutUser = topResult.title.toLowerCase().includes(nameLower) || topResult.snippet.toLowerCase().includes(nameLower);
  const consistentResults = nameResults.filter(r =>
    r.title.toLowerCase().includes(nameLower) || r.snippet.toLowerCase().includes(nameLower)
  ).length;

  if (topIsAboutUser && consistentResults >= 5) return 25;
  if (topIsAboutUser && consistentResults >= 3) return 16;
  if (consistentResults >= 1) return 8;
  return 0;
}

serve(async (req) => {



  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting by IP
  // Use the last (rightmost) IP to prevent client-side X-Forwarded-For spoofing
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",").at(-1)?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute before trying again." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_CUSTOM_SEARCH_API_KEY");
    const GOOGLE_CX = Deno.env.get("GOOGLE_SEARCH_ENGINE_ID");
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_CUSTOM_SEARCH_API_KEY not configured");
    if (!GOOGLE_CX) throw new Error("GOOGLE_SEARCH_ENGINE_ID not configured");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { full_name, profession, country, city } = await req.json();
    if (!full_name || !profession || !country || !city) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Google searches for the person
    const queries = [
      full_name,
      `${full_name} ${profession}`,
      `${full_name} ${city}`,
      `${full_name} LinkedIn`,
    ];

    const searchPromises = queries.map(q => googleSearch(q, GOOGLE_API_KEY, GOOGLE_CX));
    const searchResults = await Promise.all(searchPromises);

    const allResults = searchResults.flatMap(r => r.items);
    const nameResults = searchResults[0].items;

    // Step 2: Competitor search
    const compQueries = [
      `${profession} ${city}`,
      `best ${profession} ${city}`,
    ];
    const compSearches = await Promise.all(compQueries.map(q => googleSearch(q, GOOGLE_API_KEY, GOOGLE_CX)));
    const compResults = compSearches.flatMap(r => r.items);

    // Step 3: Scoring
    const breakdown = {
      google_results: scoreGoogleResults(nameResults, full_name),
      social_presence: scoreSocialPresence(allResults),
      content_footprint: scoreContentFootprint(allResults),
      brand_clarity: scoreBrandClarity(nameResults, full_name),
    };
    const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const tier = getTier(score);

    // Build gap list
    const gaps: string[] = [];
    if (breakdown.google_results < 15) gaps.push("Low Google search visibility");
    if (breakdown.social_presence < 16) gaps.push("Weak social media presence");
    if (breakdown.content_footprint < 16) gaps.push("Little to no thought leadership content");
    if (breakdown.brand_clarity < 16) gaps.push("Inconsistent or unclear professional brand");

    // Build competitor summary
    const competitorNames = compResults
      .slice(0, 5)
      .map(r => r.title.split(" - ")[0].split(" | ")[0].trim())
      .filter(n => n.toLowerCase() !== full_name.toLowerCase())
      .slice(0, 3);
    const competitorSummary = competitorNames.length > 0
      ? competitorNames.join(", ")
      : "No notable competitors found";

    // Step 4: AI action plan via Groq
    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a digital visibility strategist specialising in African professionals. You give sharp, specific, Africa-aware advice. Never generic. Never corporate. Always actionable. Respond only in valid JSON.",
        },
        {
          role: "user",
          content: `Generate a complete digital presence fix plan for the following professional:

Name: ${full_name}
Profession: ${profession}
City: ${city}
Country: ${country}
Presence Score: ${score}/100
Score Tier: ${tier}
Gaps Found: ${gaps.join(", ") || "None identified"}
Top Competitors Found: ${competitorSummary}

Return a JSON object with these exact keys:
{
  "action_plan": {
    "week_1": [ list of 4-5 specific actions ],
    "month_1": [ list of 4-5 specific actions ],
    "month_3": [ list of 4-5 specific actions ]
  },
  "content_blueprint": {
    "content_types": [ 3 objects: { "type": string, "example_headline": string, "platform": string, "frequency": string } ],
    "competitor_themes": [ 2-3 content themes competitors use ],
    "first_5_posts": [ 5 objects: { "title": string, "platform": string, "hook_line": string } ]
  },
  "competitors": [ 3 objects: { "name": string, "score": number (estimated 0-100), "insight": string (what they do that this person doesn't) } ],
  "diagnosis_summary": "two sentence honest summary of their situation",
  "biggest_quick_win": "single most impactful action they can take this week"
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
      throw new Error(`Groq API failed [${groqResp.status}]: ${errorText}`);
    }

    const groqData = await groqResp.json();
    const aiContent = groqData.choices?.[0]?.message?.content || "{}";

    let aiPlan: any;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      aiPlan = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.error("Failed to parse AI response:", aiContent);
      aiPlan = {
        action_plan: { week_1: [], month_1: [], month_3: [] },
        content_blueprint: { content_types: [], competitor_themes: [], first_5_posts: [] },
        competitors: [],
      };
    }

    // Step 5: Save to Supabase
    const shareToken = generateToken(10);

    const { error: insertError } = await supabase.from("audits").insert({
      full_name,
      profession,
      country,
      city,
      score,
      tier,
      breakdown,
      competitors: aiPlan.competitors || [],
      action_plan: aiPlan.action_plan || {},
      content_blueprint: aiPlan.content_blueprint || {},
      gaps,
      share_token: shareToken,
      raw_search_results: { nameResults: nameResults.slice(0, 5), compResults: compResults.slice(0, 5) },
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error(`Failed to save audit: ${insertError.message}`);
    }

    // Step 6: Return
    return new Response(
      JSON.stringify({
        share_token: shareToken,
        score,
        tier,
        breakdown,
        competitors: aiPlan.competitors,
        action_plan: aiPlan.action_plan,
        content_blueprint: aiPlan.content_blueprint,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("run-audit error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
