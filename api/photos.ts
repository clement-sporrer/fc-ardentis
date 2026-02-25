// api/photos.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit } from "./rate-limit.js";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1rLoEWymU9erExNTSiBh6bG4Zw-ra4vYL";
const CACHE_MS = 10 * 60 * 1000; // 10 min
const MAX_PHOTOS = 24;

export type DrivePhoto = {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullUrl: string;
};

type Cached<T> = { data: T; expires: number };
let cache: Cached<DrivePhoto[]> | null = null;

function getApiKey(): string {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_DRIVE_API_KEY");
  return key;
}

async function fetchPhotos(apiKey: string): Promise<DrivePhoto[]> {
  const query = encodeURIComponent(
    `'${FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`
  );
  const fields = encodeURIComponent("files(id,name)");
  const url =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${query}` +
    `&key=${encodeURIComponent(apiKey)}` +
    `&fields=${fields}` +
    `&orderBy=createdTime+desc` +
    `&pageSize=${MAX_PHOTOS}`;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);

  try {
    const res = await fetch(url, { signal: ac.signal });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Drive API ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as { files?: Array<{ id: string; name: string }> };
    return (data.files ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${f.id}&sz=w600-h400`,
      fullUrl: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1200-h900`,
    }));
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rateLimit = checkRateLimit(req, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const apiKey = getApiKey();
    const now = Date.now();

    let photos: DrivePhoto[];
    if (cache && now < cache.expires) {
      photos = cache.data;
    } else {
      photos = await fetchPhotos(apiKey);
      cache = { data: photos, expires: now + CACHE_MS };
    }

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800");
    return res.status(200).json({ photos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google Drive API error";
    return res.status(500).json({ error: message });
  }
}
