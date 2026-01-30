import { useEffect, useState } from "react";
import { Play, Radio, Youtube, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Seo } from "@/seo/Seo";
import { seoVideos } from "@/seo/seo.config";

interface YouTubeVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  channelTitle: string;
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

const Videos = () => {
  const [data, setData] = useState<YouTubeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

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
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-6">
                  Replays
                </h2>
                {data.videos.length === 0 ? (
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
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.videos.map((video) => (
                      <Card
                        key={video.id}
                        className="overflow-hidden premium-card group cursor-pointer hover-lift border-0"
                        onClick={() => setSelectedVideo(video)}
                      >
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img
                            src={video.thumbnail}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="rounded-full bg-white/90 p-4">
                              <Play className="h-8 w-8 text-primary fill-primary" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-display font-bold text-foreground line-clamp-2 mb-1">
                            {video.title}
                          </h3>
                          <p className="text-muted-foreground font-sport text-xs">
                            {formatDate(video.publishedAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video w-full">
              <iframe
                title={selectedVideo.title}
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Videos;
