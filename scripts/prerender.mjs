import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function normalizePathname(p) {
  if (!p.startsWith("/")) p = `/${p}`;
  // remove trailing slash except root
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function routeToOutFile(distDir, route) {
  const r = normalizePathname(route);
  if (r === "/") return path.join(distDir, "index.html");
  return path.join(distDir, r.slice(1), "index.html");
}

function replaceSeoHead(html, headHtml) {
  return html.replace("<!--seo-head-->", headHtml || "");
}

function replaceRoot(html, appHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

function detectDelimiter(headerLine) {
  const commas = (headerLine.match(/,/g) || []).length;
  const semicolons = (headerLine.match(/;/g) || []).length;
  return semicolons > commas ? ";" : ",";
}

function parseCSVLine(line, delim = ",") {
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
    } else if (c === delim && !inQuotes) {
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
    process.env.VITE_SHEET_PRODUCTS_CSV_URL;

  if (!url) return [];

  let res;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch {
    // No network (local sandbox) or transient error: just skip product prerendering.
    return [];
  }
  if (!res.ok) return [];

  const raw = (await res.text()).replace(/\r/g, "");
  const lines = raw.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const delim = detectDelimiter(lines[0]);
  const slugs = [];
  for (const line of lines.slice(1)) {
    const v = parseCSVLine(line, delim);
    if (v.length < 17) continue;
    // Expected: id,name,type,price_eur,image1..image10,size_guide_url,active,soldout (17 cols)
    const id = (v[0] || "").trim().toLowerCase();
    const active = (v[15] || "").trim().toLowerCase() === "true";
    if (!id || !active) continue;
    slugs.push(id);
  }
  return slugs;
}

async function main() {
  const distDir = path.resolve(process.cwd(), "dist");
  const templatePath = path.join(distDir, "index.html");
  const template = await readFile(templatePath, "utf8");

  const ssrEntry = pathToFileURL(path.resolve(process.cwd(), "dist-ssr/entry-server.js")).href;
  const { render } = await import(ssrEntry);

  const staticRoutes = [
    "/",
    "/equipe",
    "/calendrier",
    "/contacts",
    "/rejoindre",
    "/shop",
    "/cfl",
    // Checkout: prerender mainly to expose noindex in HTML (bots without JS)
    "/checkout",
    "/checkout/details",
    "/checkout/success",
    "/checkout/cancel",
    "/checkout/failed",
  ];
  const productSlugs = await getProductSlugsFromCsv();
  const productRoutes = productSlugs.map((s) => `/shop/${encodeURIComponent(s)}`);
  const routes = [...staticRoutes, ...productRoutes, "/404"];

  for (const route of routes) {
    const { appHtml, headHtml } = await render(route);
    const html = replaceRoot(replaceSeoHead(template, headHtml), appHtml);
    const outFile = routeToOutFile(distDir, route);
    await mkdir(path.dirname(outFile), { recursive: true });
    await writeFile(outFile, html, "utf8");
  }
}

main().catch((err) => {
  console.error("[prerender] failed", err);
  process.exit(1);
});


