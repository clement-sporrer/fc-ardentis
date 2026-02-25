import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Trophy, Handshake, Star, Zap, Images, X, ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { Seo } from "@/seo/Seo";
import { seoIndex } from "@/seo/seo.config";
import { parseCSVLine, stripBOM } from "@/lib/utils";

type DrivePhoto = { id: string; name: string; thumbnailUrl: string; fullUrl: string };

const EVENTS_CSV_URL = import.meta.env.VITE_GOOGLE_SHEET_EVENTS_CSV_URL || "";

type MatchEvent = {
  date: string;
  type: "match" | "entrainement";
  title: string;
  start_time?: string;
  location?: string;
  team_home?: string;
  team_away?: string;
  score_home?: number;
  score_away?: number;
  resultat?: "V" | "N" | "D";
};

const parseEventDate = (d: string): Date => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [jj, mm, aaaa] = d.split("/").map(Number);
    return new Date(aaaa, mm - 1, jj);
  }
  return new Date(d);
};

const normalizeResult = (val: string): "V" | "N" | "D" | null => {
  const v = (val || "").toLowerCase().trim();
  if (v === "win" || v === "v" || v === "victoire") return "V";
  if (v === "draw" || v === "n" || v === "nul" || v === "match nul") return "N";
  if (v === "loose" || v === "lose" || v === "d" || v === "défaite" || v === "defaite") return "D";
  return null;
};

const computeMatchResult = (e: MatchEvent): "V" | "N" | "D" | null => {
  if (e.resultat) return e.resultat;
  const h = typeof e.score_home === "number" ? e.score_home : NaN;
  const a = typeof e.score_away === "number" ? e.score_away : NaN;
  if (isNaN(h) || isNaN(a)) return null;
  if (h > a) return "V";
  if (h === a) return "N";
  return "D";
};

const Index = () => {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photosError, setPhotosError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const valuesRef = useRef<HTMLDivElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const { count: playerCount, loading: playersLoading } = useTeamPlayers();

  // Fetch events for results/next-match widget
  useEffect(() => {
    if (!EVENTS_CSV_URL) return;
    let cancelled = false;
    fetch(`${EVENTS_CSV_URL}${EVENTS_CSV_URL.includes("?") ? "&" : "?"}_ts=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.text())
      .then((raw) => {
        if (cancelled) return;
        const text = stripBOM(raw);
        if (!text.trim()) return;
        const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
        if (lines.length < 2) return;
        const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
        const idx = (name: string) => header.indexOf(name);
        const parsed: MatchEvent[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cells = parseCSVLine(lines[i]);
          const date = cells[idx("date")] || "";
          const type = (cells[idx("type")] || "").toLowerCase() as MatchEvent["type"];
          if (!date || (type !== "match" && type !== "entrainement")) continue;
          const sh = cells[idx("score_home")];
          const sa = cells[idx("score_away")];
          parsed.push({
            date,
            type,
            title: cells[idx("title")] || "",
            start_time: cells[idx("start_time")] || "",
            location: cells[idx("location")] || "",
            team_home: cells[idx("team_home")] || "",
            team_away: cells[idx("team_away")] || "",
            score_home: sh !== "" ? Number(sh) : undefined,
            score_away: sa !== "" ? Number(sa) : undefined,
            resultat: normalizeResult(cells[idx("resultat")] || "") || undefined,
          });
        }
        setMatchEvents(parsed);
      })
      .catch(() => { /* silent — widget simply won't render */ });
    return () => { cancelled = true; };
  }, []);


  // Fetch photos from Google Drive API
  useEffect(() => {
    let cancelled = false;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/photos`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setPhotos(Array.isArray(data?.photos) ? data.photos : []);
          setPhotosLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) { setPhotosError(true); setPhotosLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrevPhoto = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const goNextPhoto = useCallback(() => setLightboxIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i)), [photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrevPhoto();
      else if (e.key === "ArrowRight") goNextPhoto();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, goPrevPhoto, goNextPhoto, closeLightbox]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: Users,
      title: "Cohésion",
      description: "L'esprit d'équipe avant tout. Ensemble, nous sommes plus forts.",
      gradient: "from-primary to-primary-hover",
    },
    {
      icon: Handshake,
      title: "Respect",
      description: "Respect des coéquipiers, adversaires et du jeu lui-même.",
      gradient: "from-accent to-pink-400",
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "Viser l'excellence sur et en dehors du terrain.",
      gradient: "from-magenta to-magenta-dark",
    },
  ];

  const stats = useMemo(() => [
    { value: "2025", label: "Année de fondation", icon: Star },
    { value: playersLoading ? "..." : String(playerCount), label: "Joueurs actifs", icon: Users },
    { value: "CFL", label: "Compétition", icon: Trophy },
  ], [playerCount, playersLoading]);

  const lastResults = useMemo(() => {
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    return matchEvents
      .filter((e) => e.type === "match" && parseEventDate(e.date).getTime() < t0.getTime())
      .sort((a, b) => parseEventDate(b.date).getTime() - parseEventDate(a.date).getTime())
      .slice(0, 3);
  }, [matchEvents]);

  const nextMatch = useMemo(() => {
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    return (
      matchEvents
        .filter((e) => e.type === "match" && parseEventDate(e.date).getTime() >= t0.getTime())
        .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime())[0] || null
    );
  }, [matchEvents]);

  const formatMatchDate = (d: string) =>
    parseEventDate(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <Seo {...seoIndex()} />
      {/* Hero Section - Full Viewport */}
      <section data-hero="true" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-premium-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        {/* Content */}
        <div className="container max-w-6xl mx-auto relative z-10 text-center pt-20 pb-10">
          {/* Logo with glow effect */}
          <div className="relative inline-block mb-6 sm:mb-8 animate-rise-up">
            <div className="absolute inset-0 bg-magenta/30 blur-3xl rounded-full scale-150 animate-pulse-glow" />
            <img
              src="/assets/logo.png"
              alt="FC Ardentis Logo"
              width="240"
              height="240"
              fetchPriority="high"
              decoding="sync"
              className="relative h-32 sm:h-40 md:h-52 lg:h-60 w-auto object-contain mx-auto drop-shadow-2xl"
            />
          </div>
          
          {/* Title */}
          <h1 
            className="font-display font-bold text-white leading-none mb-4 animate-rise-up"
            style={{ animationDelay: "100ms" }}
          >
            <span className="block text-display-sm sm:text-display-md md:text-display-lg lg:text-display-xl">
              FC ARDENTIS
            </span>
          </h1>
          
          {/* Subtitle with magenta accent */}
          <div 
            className="flex items-center justify-center gap-4 mb-8 sm:mb-10 animate-rise-up"
            style={{ animationDelay: "200ms" }}
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <p className="text-lg sm:text-xl md:text-2xl text-magenta font-sport font-medium tracking-wider uppercase">
              Since 2025
            </p>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center mb-10 sm:mb-12 animate-rise-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              asChild
              variant="magenta"
              size="xl"
              className="font-display text-lg sm:text-xl px-8 sm:px-12 rounded-full"
            >
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button
              asChild
              variant="glass"
              size="xl"
              className="font-display text-lg sm:text-xl px-8 sm:px-12 rounded-full"
            >
              <Link to="/equipe">Découvrir l'équipe</Link>
            </Button>
          </div>

          {/* CFL Badge */}
          <p 
            className="text-sm sm:text-base text-white/60 font-sport max-w-xl mx-auto animate-rise-up"
            style={{ animationDelay: "400ms" }}
          >
            Football loisir • Île-de-France
          </p>
          <p 
            className="text-xs sm:text-sm text-white/50 font-sport max-w-xl mx-auto mt-2 animate-rise-up"
            style={{ animationDelay: "500ms" }}
          >
            Membres de la{" "}
            <a
              href="https://www.cflparis.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-magenta hover:text-white font-semibold underline underline-offset-2 transition-colors"
            >
              CFL Paris
            </a>
            {" "}·{" "}
            <Link to="/cfl" className="text-white/70 hover:text-white underline underline-offset-2 transition-colors">
              Infos compétition
            </Link>
          </p>
        </div>

      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center reveal-on-scroll"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-magenta mr-2" />
                  <span className="font-sport-condensed font-bold text-2xl sm:text-4xl md:text-5xl text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-white/60 font-sport text-xs sm:text-sm uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presentation Section */}
      <section
        ref={presentationRef}
        className="min-h-screen py-16 sm:py-24 bg-gradient-section relative flex items-center"
      >
        <div className="container max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display font-bold text-foreground leading-tight mb-4 reveal-on-scroll">
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Bienvenue au
              </span>
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gradient mt-2">
                FC Ardentis
              </span>
            </h2>
            <p className="text-muted-foreground font-sport text-lg sm:text-xl max-w-2xl mx-auto reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
              Un club où passion et convivialité se rencontrent
            </p>
          </div>

          {/* Presentation Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-5xl mx-auto">
            <div className="premium-card p-6 sm:p-8 reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">Notre ADN</h3>
              </div>
              <p className="text-muted-foreground font-sport text-base sm:text-lg leading-relaxed">
                Le FC Ardentis est un <strong>club de football amateur loisir</strong> en région parisienne.
                Nous rassemblons des joueurs de tous niveaux autour de valeurs fortes : cohésion, respect et performance.
              </p>
            </div>
            
            <div className="premium-card p-6 sm:p-8 reveal-on-scroll" style={{ transitionDelay: "300ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">Rejoignez-nous</h3>
              </div>
              <p className="text-muted-foreground font-sport text-base sm:text-lg leading-relaxed">
                Que vous soyez débutant ou expérimenté, notre équipe vous accueille avec
                enthousiasme. Rejoignez notre famille sportive et vivez l'aventure
                collective du football en région parisienne.
              </p>
            </div>
          </div>

          {/* Values Cards */}
          <div ref={valuesRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="group premium-card p-6 sm:p-8 text-center reveal-on-scroll"
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <div className={`bg-gradient-to-br ${value.gradient} p-4 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center`}>
                  <value.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground font-sport text-sm sm:text-base">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Info Section */}
      <section
        ref={infoRef}
        className="min-h-screen py-16 sm:py-24 bg-gradient-hero-alt relative flex items-center overflow-hidden"
      >
        {/* Background orbs */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container max-w-6xl mx-auto relative z-10">
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display font-bold text-white leading-tight mb-4 reveal-on-scroll">
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                Infos pratiques
              </span>
            </h2>
            <div className="flex items-center justify-center gap-4 reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-magenta" />
              <Star className="h-4 w-4 text-magenta" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-magenta" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Location Card */}
            <div className="glass rounded-3xl p-6 sm:p-8 reveal-on-scroll hover-lift" style={{ transitionDelay: "200ms" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-accent/20">
                  <MapPin className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Localisation
                </h3>
              </div>
              <div className="text-white/80 font-sport mb-6 text-base sm:text-lg space-y-2">
                <p>Entraînements à <span className="text-magenta font-semibold">Colombes</span></p>
                <p>Matchs en <span className="text-magenta font-semibold">région parisienne</span></p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-elevated border border-white/10">
                <iframe
                  title="Carte — Stade Yves-du-Manoir, Colombes"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2621.270964990178!2d2.2453925762012723!3d48.9292805957155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e665da9e08e561%3A0x65455f9e577c366!2sStade%20Yves-du-Manoir!5e0!3m2!1sfr!2sfr!4v1766965804730!5m2!1sfr!2sfr"
                  width="100%"
                  height="200"
                  className="sm:h-[250px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 reveal-on-scroll hover-lift" style={{ transitionDelay: "300ms" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/20">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Créneaux
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <p className="text-magenta font-display font-bold mb-2 text-lg">
                    Entraînements
                  </p>
                  <p className="text-white/90 font-sport text-base">
                    Dimanche à 11h • Colombes
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                  <p className="text-accent font-display font-bold mb-2 text-lg">
                    Matchs officiels
                  </p>
                  <p className="text-white/90 font-sport text-base">
                    Lundi ou mercredi • Région parisienne
                  </p>
                </div>
              </div>
              <Link
                to="/contacts"
                className="inline-flex items-center gap-2 mt-6 text-magenta hover:text-white font-sport font-medium transition-colors group"
              >
                Plus d'infos sur la page Contacts
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Photo Gallery Section */}
      <section ref={photoRef} className="py-16 sm:py-24 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="flex items-center justify-center gap-4 mb-4 reveal-on-scroll">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <Images className="h-6 w-6 text-primary" />
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-3 reveal-on-scroll">
              Galerie photos
            </h2>
            <p className="text-muted-foreground font-sport text-lg reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
              Nos meilleurs moments capturés
            </p>
          </div>

          {photosLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {!photosLoading && photosError && (
            <div className="premium-card p-8 text-center reveal-on-scroll max-w-md mx-auto">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-sport">Impossible de charger la galerie.</p>
            </div>
          )}

          {!photosLoading && !photosError && photos.length === 0 && (
            <div className="premium-card p-10 text-center reveal-on-scroll max-w-md mx-auto">
              <Images className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-sport">Aucune photo pour le moment.</p>
            </div>
          )}

          {!photosLoading && photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Voir la photo ${photo.name}`}
                  onClick={() => openLightbox(idx)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Images className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse de photos"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Photo précédente"
            onClick={(e) => { e.stopPropagation(); goPrevPhoto(); }}
            disabled={lightboxIndex === 0}
            className="absolute left-4 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={photos[lightboxIndex].fullUrl}
            alt={photos[lightboxIndex].name}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={(e) => { e.stopPropagation(); goNextPhoto(); }}
            disabled={lightboxIndex === photos.length - 1}
            className="absolute right-4 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 font-sport text-sm">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>
      )}

      {/* Results & Next Match Section */}
      {(lastResults.length > 0 || nextMatch) && (
        <section className="py-12 sm:py-16 bg-secondary relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <div className="container max-w-6xl mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-magenta" />
                  <span className="text-magenta font-sport uppercase tracking-wider text-xs font-semibold">Actualité sportive</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  Résultats & agenda
                </h2>
              </div>
              <Link
                to="/calendrier"
                className="text-sm text-white/50 hover:text-white font-sport transition-colors flex items-center gap-1 group"
              >
                Tout voir
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Last Results */}
              {lastResults.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">
                    Derniers résultats
                  </h3>
                  <div className="space-y-2.5">
                    {lastResults.map((e, i) => {
                      const res = computeMatchResult(e);
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-2 text-sm font-sport text-white/90 min-w-0 flex-1">
                            <span className="truncate">{e.team_home || "—"}</span>
                            {e.score_home !== undefined && e.score_away !== undefined && (
                              <span className="font-display font-bold text-base text-primary flex-shrink-0">
                                {e.score_home} – {e.score_away}
                              </span>
                            )}
                            <span className="truncate">{e.team_away || "—"}</span>
                          </div>
                          {res && (
                            <span
                              className={`ml-3 px-2.5 py-1 rounded-full text-xs font-display font-bold flex-shrink-0 ${
                                res === "V"
                                  ? "bg-green-500 text-white"
                                  : res === "N"
                                  ? "bg-gray-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {res}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Match */}
              <div>
                <h3 className="font-display font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">
                  Prochain match
                </h3>
                {nextMatch ? (
                  <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="font-display font-bold text-white text-lg truncate">
                        {nextMatch.team_home || "FC Ardentis"}
                      </span>
                      <span className="text-primary font-bold text-sm flex-shrink-0">VS</span>
                      <span className="font-display font-bold text-white text-lg truncate">
                        {nextMatch.team_away || "?"}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-center text-sm font-sport text-white/60">
                      <p className="capitalize">{formatMatchDate(nextMatch.date)}</p>
                      {nextMatch.start_time && (
                        <p className="flex items-center justify-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {nextMatch.start_time}
                        </p>
                      )}
                      {nextMatch.location && (
                        <p className="flex items-center justify-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {nextMatch.location}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-white/40 font-sport text-sm">
                    Aucun match programmé
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-hero relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-magenta/5 rounded-full blur-3xl" />
        
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 reveal-on-scroll leading-tight">
            Prêt à rejoindre<br />l'aventure ?
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 sm:mb-12 font-sport max-w-2xl mx-auto reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
            Que vous souhaitiez jouer, soutenir ou simplement découvrir notre club, 
            nous vous accueillons avec passion !
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
            <Button
              asChild
              variant="magenta"
              size="xl"
              className="font-display text-lg sm:text-xl px-10 sm:px-14 rounded-full"
            >
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button
              asChild
              variant="glass"
              size="xl"
              className="font-display text-lg sm:text-xl px-10 sm:px-14 rounded-full"
            >
              <Link to="/equipe">Rencontrer l'équipe</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
