/**
 * South African mobile numbers → E.164 (+27 followed by 9 digits, first digit 6, 7 or 8).
 * Accepts 0821234567, 082 123 4567, +27 82 123 4567, 27821234567, +27 (0)82…
 */
export function normaliseSaMobile(input: string): string | null {
  let digits = input.replace(/\(0\)/g, "").replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.startsWith("0027")) digits = digits.slice(4);
  else if (digits.startsWith("27") && digits.length === 11) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 10) digits = digits.slice(1);
  if (!/^[678]\d{8}$/.test(digits)) return null;
  return "+27" + digits;
}

/** Masked for display: +27 82 *** 4567. */
export function maskPhone(e164: string): string {
  return e164.slice(0, 3) + " " + e164.slice(3, 5) + " *** " + e164.slice(-4);
}
