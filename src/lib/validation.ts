/**
 * Validation utilities for user inputs
 * Provides secure validation with length limits and sanitization
 */

// RFC 5322 compliant email regex (simplified but secure)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Field length limits
export const FIELD_LIMITS = {
  firstName: 50,
  lastName: 50,
  email: 254, // RFC 5321 limit
  phone: 20,
  message: 2000,
  note: 1000,
  company: 100,
  website: 200,
  poste: 50,
  canal: 50,
  size: 10,
  number: 10,
  flocage: 50,
} as const;

/**
 * Validates and sanitizes a string input
 */
export function sanitizeString(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength);
}

/**
 * Validates email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > FIELD_LIMITS.email) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validates name (first or last)
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > FIELD_LIMITS.firstName) return false;
  // Allow letters, spaces, hyphens, apostrophes (for names like O'Brien, Jean-Pierre)
  return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed);
}

/**
 * Validates phone number (basic check, detailed validation done by libphonenumber-js)
 */
export function isValidPhoneFormat(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (trimmed.length === 0 || trimmed.length > FIELD_LIMITS.phone) return false;
  // Basic format check (allows international format)
  return /^[\d\s+\-()]+$/.test(trimmed);
}

/**
 * Validates message/note text
 */
export function isValidText(text: string, maxLength: number = FIELD_LIMITS.message): boolean {
  if (typeof text !== "string") return false;
  return text.trim().length <= maxLength;
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > FIELD_LIMITS.website) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

