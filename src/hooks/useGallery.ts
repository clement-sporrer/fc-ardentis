import { useQuery } from "@tanstack/react-query";

export interface GalleryPhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  viewUrl: string;
}

async function fetchGallery(): Promise<GalleryPhoto[]> {
  const res = await fetch("/api/gallery");
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { photos: GalleryPhoto[] };
  return data.photos;
}

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: fetchGallery,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}
