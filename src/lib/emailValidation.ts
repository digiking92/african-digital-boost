const SUSPICIOUS_LOCAL_PARTS = new Set([
  "test",
  "fake",
  "spam",
  "noreply",
  "no-reply",
  "admin",
  "asdf",
  "qwerty",
  "abc",
  "null",
  "undefined",
  "example",
  "user",
  "email",
]);

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
]);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseEmail(email: string): { local: string; domain: string } | null {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return null;
  const match = trimmed.match(/^([^\s@]+)@([^\s@]+\.[^\s@]{2,})$/);
  if (!match) return null;
  return { local: match[1].toLowerCase(), domain: match[2].toLowerCase() };
}

export function isAllowedEmailProvider(domain: string): boolean {
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

/** Returns an error message, or null if the email is allowed. */
export function validateAuditEmail(email: string): string | null {
  const parsed = parseEmail(email);
  if (!parsed) {
    return "Please enter a valid email address.";
  }

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

export function isValidEmail(email: string): boolean {
  return validateAuditEmail(email) === null;
}
