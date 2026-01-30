import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SITE_URL = "https://fcardentis.fr";

function getSiteUrl() {
  const raw = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).trim();
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function toAbs(pathname) {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${p}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

async function getProductSlugsFromCsv() {
  const url =
    process.env.VITE_SHEET_PRODUCTS_CSV_URL ||
    process.env.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL ||
    "";
  if (!url) return [];

  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch {
    return [];
  }
  if (!res.ok) return [];

  const raw = (await res.text()).replace(/\r/g, "");
  const lines = raw.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const slugs = [];
  for (const line of lines.slice(1)) {
    const v = parseCSVLine(line);
    const id = (v[0] || "").trim().toLowerCase();
    const active = (v[9] || "").trim().toLowerCase() === "true";
    if (!id || !active) continue;
    slugs.push(id);
  }
  return slugs;
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${escXml(loc)}</loc>
    <lastmod>${escXml(lastmod)}</lastmod>
    <changefreq>${escXml(changefreq)}</changefreq>
    <priority>${escXml(priority)}</priority>
  </url>`;
}

async function main() {
  const publicDir = path.resolve(process.cwd(), "public");
  const outFile = path.join(publicDir, "sitemap.xml");

  // Preserve existing sitemap if generation totally fails.
  const previous = await readFile(outFile, "utf8").catch(() => "");

  const baseRoutes = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/equipe", changefreq: "weekly", priority: "0.9" },
    { path: "/calendrier", changefreq: "daily", priority: "0.9" },
    { path: "/videos", changefreq: "daily", priority: "0.9" },
    { path: "/cfl", changefreq: "weekly", priority: "0.8" },
    { path: "/shop", changefreq: "weekly", priority: "0.9" },
    { path: "/rejoindre", changefreq: "monthly", priority: "0.8" },
    { path: "/contacts", changefreq: "monthly", priority: "0.7" },
  ];

  const slugs = await getProductSlugsFromCsv();
  const routes = [
    ...baseRoutes,
    ...slugs.map((id) => ({
      path: `/shop/${encodeURIComponent(id)}`,
      changefreq: "weekly",
      priority: "0.7",
    })),
  ];

  const lastmod = todayISO();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) =>
    urlEntry({
      loc: toAbs(r.path),
      lastmod,
      changefreq: r.changefreq,
      priority: r.priority,
    })
  ).join("\n")}
</urlset>
`;

  try {
    await writeFile(outFile, xml, "utf8");
  } catch (err) {
    // Restore previous on failure.
    if (previous) await writeFile(outFile, previous, "utf8").catch(() => {});
    throw err;
  }
}

main().catch((err) => {
  console.error("[sitemap] failed", err);
  process.exit(1);
});


