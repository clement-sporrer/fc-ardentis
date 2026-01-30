import type { VercelRequest, VercelResponse } from "@vercel/node";

const CACHE_VIDEOS_MS = 5 * 60 * 1000; // 5 min
const CACHE_LIVE_MS = 2 * 60 * 1000; // 2 min
const MAX_VIDEOS = 12;

type Cached<T> = { data: T; expires: number };

let cacheVideos: Cached<YouTubeVideo[]> | null = null;
let cacheLive: Cached<LiveInfo> | null = null;

export interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelTitle: string;
}

export interface LiveInfo {
  isLive: boolean;
  videoId?: string;
  title?: string;
}

export interface YouTubeApiResponse {
  videos: YouTubeVideo[];
  live: LiveInfo;
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("Missing YOUTUBE_API_KEY");
  return key;
}

function getChannelId(): string {
  const id = process.env.YOUTUBE_CHANNEL_ID;
  if (!id) throw new Error("Missing YOUTUBE_CHANNEL_ID");
  return id;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson<{
    items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
  }>(url);
  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error("Channel has no uploads playlist");
  return uploads;
}

async function fetchVideos(apiKey: string, channelId: string): Promise<YouTubeVideo[]> {
  const playlistId = await getUploadsPlaylistId(apiKey, channelId);
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(playlistId)}&maxResults=${MAX_VIDEOS}&key=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson<{
    items?: Array<{
      snippet?: {
        resourceId?: { videoId?: string };
        title?: string;
        publishedAt?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
        channelTitle?: string;
      };
    }>;
  };
  const videos: YouTubeVideo[] = [];
  for (const item of data.items ?? []) {
    const sn = item.snippet;
    const videoId = sn?.resourceId?.videoId;
    if (!videoId) continue;
    const thumb = sn?.thumbnails?.high?.url ?? sn?.thumbnails?.medium?.url ?? sn?.thumbnails?.default?.url ?? "";
    videos.push({
      id: videoId,
      title: sn?.title ?? "",
      publishedAt: sn?.publishedAt ?? "",
      thumbnail: thumb,
      channelTitle: sn?.channelTitle ?? "",
    });
  }
  return videos;
}

async function fetchLive(apiKey: string, channelId: string): Promise<LiveInfo> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&eventType=live&type=video&key=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson<{
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string };
    }>;
  }>(url);
  const first = data.items?.[0];
  const videoId = first?.id?.videoId;
  if (!videoId) return { isLive: false };
  return {
    isLive: true,
    videoId,
    title: first?.snippet?.title,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = getApiKey();
    const channelId = getChannelId();
    const now = Date.now();

    // Serve cached videos if valid
    let videos: YouTubeVideo[];
    if (cacheVideos && now < cacheVideos.expires) {
      videos = cacheVideos.data;
    } else {
      videos = await fetchVideos(apiKey, channelId);
      cacheVideos = { data: videos, expires: now + CACHE_VIDEOS_MS };
    }

    // Serve cached live if valid
    let live: LiveInfo;
    if (cacheLive && now < cacheLive.expires) {
      live = cacheLive.data;
    } else {
      live = await fetchLive(apiKey, channelId);
      cacheLive = { data: live, expires: now + CACHE_LIVE_MS };
    }

    const payload: YouTubeApiResponse = { videos, live };
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "YouTube API error";
    return res.status(500).json({ error: message });
  }
}
