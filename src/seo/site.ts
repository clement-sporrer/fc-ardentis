export const DEFAULT_SITE_URL = "https://fcardentis.fr";

/**
 * Canonical site URL used for SEO tags (canonical/OG/JSON-LD).
 * Prefer configuring it via VITE_SITE_URL in Vercel env.
 */
export function getSiteUrl(): string {
  const raw = (import.meta as any)?.env?.VITE_SITE_URL as string | undefined;
  const s = (raw || DEFAULT_SITE_URL).trim();
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export function toAbsoluteUrl(pathname: string): string {
  const base = getSiteUrl();
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${p}`;
}


