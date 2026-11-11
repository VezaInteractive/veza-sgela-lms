/**
 * Email addresses for login (D-039). Normalise to a trimmed, lower-cased address and validate
 * loosely (one @, a dotted domain, no spaces, length ≤ 254). Not an RFC-complete parser — just
 * enough to reject typos before sending a code.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normaliseEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

/** Masked for display: "ab***@gmail.com" (keeps the first two local chars and the domain). */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const head = local.slice(0, Math.min(2, local.length));
  return head + "***" + domain;
}
