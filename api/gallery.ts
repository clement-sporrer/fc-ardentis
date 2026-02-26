import type { VercelRequest, VercelResponse } from "@vercel/node";

const CACHE_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PHOTOS = 50;

export interface GalleryPhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  viewUrl: string;
}

export interface GalleryApiResponse {
  photos: GalleryPhoto[];
}

type Cached<T> = { data: T; expires: number };
let cache: Cached<GalleryPhoto[]> | null = null;

function getApiKey(): string {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_DRIVE_API_KEY");
  return key;
}

function getFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID");
  return id;
}

async function fetchPhotos(apiKey: string, folderId: string): Promise<GalleryPhoto[]> {
  const q = encodeURIComponent(
    `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`
  );
  const fields = encodeURIComponent("files(id,name)");
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=createdTime+desc&pageSize=${MAX_PHOTOS}&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Drive API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    files?: Array<{ id?: string; name?: string }>;
  };

  return (data.files ?? [])
    .filter((f): f is { id: string; name: string } => Boolean(f.id && f.name))
    .map((f) => ({
      id: f.id,
      name: f.name,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${f.id}&sz=w600`,
      viewUrl: `https://drive.google.com/file/d/${f.id}/view`,
    }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = getApiKey();
    const folderId = getFolderId();
    const now = Date.now();

    let photos: GalleryPhoto[];
    if (cache && now < cache.expires) {
      photos = cache.data;
    } else {
      photos = await fetchPhotos(apiKey, folderId);
      cache = { data: photos, expires: now + CACHE_MS };
    }

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json({ photos } satisfies GalleryApiResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gallery API error";
    return res.status(500).json({ error: message });
  }
}
