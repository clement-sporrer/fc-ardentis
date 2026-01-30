import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely converts any value to a number
 * Handles strings with commas (European decimal format), NaN, undefined, etc.
 * @param value - The value to convert
 * @param fallback - Default value if conversion fails (default: 0)
 * @returns A finite number or the fallback value
 */
export function toNumberSafe(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const str = String(value ?? "").replace(",", ".");
  const num = parseFloat(str);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Parses a CSV line respecting quoted fields
 * Handles escaped quotes ("") within quoted fields
 * @param line - The CSV line to parse
 * @param delimiter - The delimiter character (default: ",")
 * @returns Array of trimmed field values
 */
export function parseCSVLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Strips BOM (Byte Order Mark) from the start of a string
 * @param str - The string to process
 * @returns String without BOM
 */
export function stripBOM(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str;
}

/**
 * Detects the delimiter used in a CSV header line
 * @param headerLine - The first line of the CSV
 * @returns The detected delimiter ("," or ";")
 */
export function detectCSVDelimiter(headerLine: string): string {
  const commas = (headerLine.match(/,/g) || []).length;
  const semicolons = (headerLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

/**
 * Normalizes a string for comparison (lowercase, no accents, underscores for spaces)
 * @param str - The string to normalize
 * @returns Normalized string
 */
export function normalizeString(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

/**
 * Builds a Google Sheets CSV URL with cache-busting timestamp
 * @param baseUrl - The base CSV URL
 * @returns URL with timestamp parameter
 */
export function buildCSVUrl(baseUrl: string): string {
  if (!baseUrl) return "";
  let url = baseUrl;
  try {
    url = decodeURIComponent(url);
  } catch {
    // Already decoded or invalid
  }
  // Remove existing timestamp parameter
  url = url.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  // Add new timestamp
  return url + (url.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
}

/**
 * Parses YouTube ISO 8601 duration to readable format
 * @param iso - e.g. PT1H23M45S, PT15M30S, PT45S
 * @returns e.g. 1:23:45, 15:30, 0:45
 */
export function parseDuration(iso: string): string {
  if (!iso || typeof iso !== "string") return "";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = match[1] ? parseInt(match[1], 10) : 0;
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const s = match[3] ? parseInt(match[3], 10) : 0;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Formats an ISO date string to French month + year
 * @param iso - e.g. 2025-01-15T12:00:00Z
 * @returns e.g. janvier 2025
 */
export function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
