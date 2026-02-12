import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Play,
  Radio,
  Youtube,
  AlertCircle,
  ExternalLink,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Seo } from "@/seo/Seo";
import { seoVideos } from "@/seo/seo.config";
import { parseDuration, formatMonth } from "@/lib/utils";

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
}

interface LiveInfo {
  isLive: boolean;
  videoId?: string;
  title?: string;
}

interface YouTubeApiResponse {
  videos: YouTubeVideo[];
  live: LiveInfo;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isMatchTitle(title: string): boolean {
  const t = title.toLowerCase();
  return /(\svs\s|fc\s*ardentis)/i.test(t);
}

const Videos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<YouTubeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const videos = data?.videos ?? [];
  const selectedVideo = selectedIndex !== null ? videos[selectedIndex] ?? null : null;

  const groupedVideos = useMemo(() => {
    const map = new Map<string, YouTubeVideo[]>();
    for (const v of videos) {
      const key = formatMonth(v.publishedAt) || "Autre";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const dateA = new Date(a[1][0]?.publishedAt ?? 0).getTime();
      const dateB = new Date(b[1][0]?.publishedAt ?? 0).getTime();
      return dateB - dateA;
    });
    return entries;
  }, [videos]);

  const openVideo = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      const id = videos[index]?.id;
      if (id && typeof window !== "undefined") {
        setSearchParams({ v: id }, { replace: true });
      }
    },
    [videos, setSearchParams]
  );

  const closeVideo = useCallback(() => {
    setSelectedIndex(null);
    if (typeof window !== "undefined") {
      setSearchParams({}, { replace: true });
    }
  }, [setSearchParams]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null) return;
    if (selectedIndex > 0) openVideo(selectedIndex - 1);
  }, [selectedIndex, openVideo]);

  const goNext = useCallback(() => {
    if (selectedIndex === null) return;
    if (selectedIndex < videos.length - 1) openVideo(selectedIndex + 1);
  }, [selectedIndex, videos.length, openVideo]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("revealed");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, error, data]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${base}/api/youtube`, { cache: "no-store" });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody?.error || `HTTP ${res.status}`);
        }
        const json: YouTubeApiResponse = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur lors du chargement des vidéos.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || !data?.videos.length) return;
    const v = searchParams.get("v");
    if (!v) return;
    const idx = data.videos.findIndex((vid) => vid.id === v);
    if (idx >= 0) setSelectedIndex(idx);
  }, [loading, data?.videos, searchParams]);

  useEffect(() => {
    if (!selectedVideo) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.("input") || target?.closest?.("textarea")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedVideo, goPrev, goNext]);

  const renderVideoCard = (video: YouTubeVideo, index: number) => {
    const durationStr = video.duration ? parseDuration(video.duration) : "";
    const isMatch = isMatchTitle(video.title);
    const cardContent = (
      <>
        <div className={`relative overflow-hidden bg-muted ${viewMode === "grid" ? "aspect-video" : "h-24 w-40 shrink-0"}`}>
          <img
            src={video.thumbnail}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="rounded-full bg-white/90 p-3">
              <Play className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
          {durationStr && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 font-sport text-xs text-white">
              {durationStr}
            </span>
          )}
          {isMatch && (
            <span className="absolute top-1.5 left-1.5 rounded bg-primary px-1.5 py-0.5 font-sport text-xs text-primary-foreground">
              Match
            </span>
          )}
        </div>
        <CardContent className={viewMode === "list" ? "flex-1 min-w-0 p-4" : "p-4"}>
          <h3 className="font-display font-bold text-foreground line-clamp-2 mb-1">{video.title}</h3>
          <p className="text-muted-foreground font-sport text-xs">{formatDate(video.publishedAt)}</p>
        </CardContent>
      </>
    );
    return (
      <Card
        key={video.id}
        className={`overflow-hidden premium-card group cursor-pointer hover-lift border-0 ${
          viewMode === "list" ? "flex flex-row" : ""
        }`}
        onClick={() => openVideo(index)}
      >
        {cardContent}
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      <Seo {...seoVideos()} />
      {/* Hero Section */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <Play className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>

          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Vidéos</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-2xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Replays des matchs et directs du FC Ardentis
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-6xl mx-auto">
          {error && (
            <div className="premium-card p-6 sm:p-8 mb-12 flex items-start gap-4 reveal-on-scroll">
              <AlertCircle className="h-8 w-8 text-destructive shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-bold text-lg text-foreground mb-2">Impossible de charger les vidéos</h2>
                <p className="text-muted-foreground font-sport text-sm mb-4">{error}</p>
                <a
                  href="https://youtube.com/@fc_ardentis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-sport font-medium hover:underline"
                >
                  <Youtube className="h-4 w-4" />
                  Voir la chaîne YouTube
                </a>
              </div>
            </div>
          )}

          {loading && !error && (
            <>
              <div className="mb-12">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-10 w-40 mb-6" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-video rounded-xl" />
                  ))}
                </div>
              </div>
            </>
          )}

          {!loading && data && !error && (
            <>
              {/* Live Section */}
              {data.live.isLive && data.live.videoId && (
                <div className="mb-12 reveal-on-scroll">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600">
                      <Radio className="h-5 w-5 text-white animate-pulse" />
                    </span>
                    <div>
                      <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
                        En direct
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white animate-pulse">
                          LIVE
                        </span>
                      </h2>
                      {data.live.title && (
                        <p className="text-muted-foreground font-sport text-sm mt-0.5">{data.live.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="premium-card overflow-hidden p-0">
                    <div className="aspect-video w-full">
                      <iframe
                        title="Match en direct"
                        src={`https://www.youtube.com/embed/${data.live.videoId}?autoplay=0`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Replays Section */}
              <div className="reveal-on-scroll">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Replays</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "outline"}
                      size="icon"
                      aria-label="Vue grille"
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "outline"}
                      size="icon"
                      aria-label="Vue liste"
                      onClick={() => setViewMode("list")}
                    >
                      <LayoutList className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {videos.length === 0 ? (
                  <div className="premium-card p-8 text-center">
                    <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-sport">Aucune vidéo pour le moment.</p>
                    <a
                      href="https://youtube.com/@fc_ardentis"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-primary font-sport font-medium hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Chaîne YouTube
                    </a>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="space-y-10">
                    {groupedVideos.map(([monthLabel, monthVideos]) => (
                      <div key={monthLabel}>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-4 capitalize">{monthLabel}</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {monthVideos.map((video) => {
                            const index = videos.indexOf(video);
                            return renderVideoCard(video, index);
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedVideos.map(([monthLabel, monthVideos]) => (
                      <div key={monthLabel}>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-3 capitalize">{monthLabel}</h3>
                        <div className="space-y-2">
                          {monthVideos.map((video) => {
                            const index = videos.indexOf(video);
                            return renderVideoCard(video, index);
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Video Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && closeVideo()}>
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4 pb-2">
            <DialogTitle className="font-display font-bold text-lg pr-8">{selectedVideo?.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Lecteur vidéo YouTube embarqué.
            </DialogDescription>
            {selectedVideo && (
              <p className="text-muted-foreground font-sport text-sm mt-1">{formatDate(selectedVideo.publishedAt)}</p>
            )}
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full px-6">
              <iframe
                key={selectedVideo.id}
                title={selectedVideo.title}
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
          <DialogFooter className="flex flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={selectedIndex === null || selectedIndex <= 0}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={selectedIndex === null || selectedIndex >= videos.length - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {selectedVideo && (
              <a
                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground font-sport text-sm hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Voir sur YouTube
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Videos;
