function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripErroneousYouShould(text: string): string {
  return text.replace(/^you should\s+/i, "");
}

function dedupeNameGreeting(text: string, firstName: string, fullName: string): string {
  let result = text.trim();
  const fn = escapeRegex(firstName);
  const full = fullName ? escapeRegex(fullName) : "";

  if (full) {
    result = result.replace(new RegExp(`^${fn}\\s*,\\s*${full}\\b`, "i"), "You");
    result = result.replace(new RegExp(`^${fn}\\s*,\\s*${fn}\\b`, "i"), "You");
    result = result.replace(new RegExp(`^${full}\\s*,\\s*${full}\\b`, "i"), "You");
  }

  return result.trim();
}

function rewritePassivePhrasing(text: string): string {
  return text
    .replace(/based on the available data,?\s*it is estimated that\s*/gi, "")
    .replace(/based on (?:the )?findable (?:public )?data,?\s*/gi, "")
    .replace(/it is estimated that\s*/gi, "")
    .trim();
}

/** Swap the audit subject's name for "You" with correct verb form. */
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
    result = result.replace(new RegExp(`\\b${esc}\\s+are\\b`, "gi"), "You are");
    result = result.replace(new RegExp(`\\b${esc}\\s+have\\b`, "gi"), "You have");
    result = result.replace(new RegExp(`\\b${esc}\\s+appears\\b`, "gi"), "You appear");
    result = result.replace(new RegExp(`\\b${esc}\\b`, "gi"), "you");
  }

  return result;
}

/** Fix grammar after naive "You" substitution (You is → You are, etc.). */
function fixYouVerbAgreement(text: string): string {
  return text
    .replace(/\bYou is\b/g, "You are")
    .replace(/\byou is\b/g, "you are")
    .replace(/\bYou has\b/g, "You have")
    .replace(/\byou has\b/g, "you have")
    .replace(/\bYou was\b/g, "You were")
    .replace(/\byou was\b/g, "you were")
    .replace(/\bYou does\b/g, "You do")
    .replace(/\byou does\b/g, "you do")
    .replace(/\bYou needs\b/g, "You need")
    .replace(/\byou needs\b/g, "you need")
    .replace(/\bYou appears\b/g, "You appear")
    .replace(/\byou appears\b/g, "you appear");
}

/** Convert he/she/his/her → you/your. */
export function thirdToSecondPerson(text: string): string {
  return text
    .replace(/\b(he|she)\s+has\b/gi, "you have")
    .replace(/\b(he|she)\s+is\b/gi, "you are")
    .replace(/\b(he|she)\s+was\b/gi, "you were")
    .replace(/\b(his|her)\s+/gi, "your ")
    .replace(/\bhim\b/gi, "you")
    .replace(/\bhe's\b/gi, "you're")
    .replace(/\bshe's\b/gi, "you're")
    .replace(/\bhimself\b/gi, "yourself")
    .replace(/\bherself\b/gi, "yourself");
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").replace(/\s+([,.])/g, "$1").trim();
}

/** Replace em/en dashes with plain English punctuation. */
function replaceLongDashes(text: string): string {
  return text
    .replace(/\s*—\s*/g, ". ")
    .replace(/(\d)\s*–\s*(\d)/g, "$1 to $2")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\.\s+\./g, ".")
    .trim();
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Core pipeline: expert speaking directly to the reader with correct grammar. */
function polishToExpertVoice(text: string, firstName: string, fullName: string): string {
  let result = stripErroneousYouShould(text.trim());
  if (!result) return result;

  result = dedupeNameGreeting(result, firstName, fullName);
  result = rewritePassivePhrasing(result);
  result = replaceSubjectNameWithYou(result, firstName, fullName);
  result = thirdToSecondPerson(result);
  result = fixYouVerbAgreement(result);
  result = result.replace(/\bYou you\b/gi, "You");
  result = replaceLongDashes(result);
  result = normalizeWhitespace(result);

  return capitalizeFirst(result);
}

/** Factual verified claims: coach stating what they found online. */
export function polishVerifiedClaim(claim: string, firstName: string, fullName: string): string {
  return polishToExpertVoice(claim, firstName, fullName);
}

/** Expert narrative: interpretation and perception sections. */
export function polishExpertNarrative(text: string, firstName: string, fullName: string): string {
  let result = polishToExpertVoice(text, firstName, fullName);
  if (!result) return result;

  // Reframe dry score lines into direct coach language
  result = result.replace(
    /\byou have a (?:moderate-strong|moderate|strong) visibility score of (\d+)\/100\b/gi,
    "You're scoring $1/100 on visibility",
  );

  return result;
}

/** Action items only: ensure imperative coach voice. */
export function toDirectAdvice(text: string): string {
  const trimmed = replaceLongDashes(text.trim());
  if (!trimmed) return trimmed;

  const cleaned = stripErroneousYouShould(trimmed);

  if (/^(you should|you need to|you're|you are|your |start by|focus on|this week|pitch |post |publish |turn |unify |optimi|create |update |set up|build |write |share )/i.test(cleaned)) {
    return fixYouVerbAgreement(cleaned);
  }

  if (/\b(has a|have a|appears|shows up|is listed|was found|profile on)\b/i.test(cleaned)) {
    return capitalizeFirst(fixYouVerbAgreement(cleaned));
  }

  if (/^[A-Z]/.test(cleaned) && !cleaned.startsWith("You ")) {
    return fixYouVerbAgreement(`You should ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`);
  }

  return fixYouVerbAgreement(cleaned);
}

/** @deprecated Use polishExpertNarrative */
export function toExpertRead(text: string, firstName: string, fullName = ""): string {
  return polishExpertNarrative(text, firstName, fullName);
}
