import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Trophy, Handshake, ChevronDown, Star, Zap } from "lucide-react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";

const GOOGLE_PHOTOS_ALBUM_SHARE_URL = import.meta.env.VITE_GOOGLE_PHOTOS_ALBUM_SHARE_URL || "";

const Index = () => {
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const valuesRef = useRef<HTMLDivElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const { count: playerCount, loading: playersLoading } = useTeamPlayers();

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (GOOGLE_PHOTOS_ALBUM_SHARE_URL) {
      setPhotosLoaded(true);
    }

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

    // Observe all reveal elements
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

  return (
    <>
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
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-20 pb-10">
          {/* Logo with glow effect */}
          <div className="relative inline-block mb-6 sm:mb-8 animate-rise-up">
            <div className="absolute inset-0 bg-magenta/30 blur-3xl rounded-full scale-150 animate-pulse-glow" />
            <img
              src="/assets/logo.png"
              alt="FC Ardentis Logo"
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
            Membres de la{" "}
            <a
              href="https://www.cflparis.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-magenta hover:text-white font-semibold underline underline-offset-2 transition-colors"
            >
              Commission de Football Loisir
            </a>
            {" "}— Compétition parisienne
          </p>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection(presentationRef)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white transition-all duration-300 group cursor-pointer p-4"
          aria-label="Scroll to next section"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-sport uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Explorer</span>
            <ChevronDown className="h-8 w-8 animate-bounce" />
          </div>
        </button>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
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
        className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 bg-gradient-section relative flex items-center"
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
                Né de la passion commune pour le football, le FC Ardentis rassemble des
                joueurs de tous niveaux autour des valeurs de respect et d'excellence.
                Notre club offre un environnement bienveillant pour progresser.
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

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection(infoRef)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/40 hover:text-foreground transition-all duration-300 group cursor-pointer p-4"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </button>
      </section>

      {/* Info Section */}
      <section
        ref={infoRef}
        className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 bg-gradient-hero-alt relative flex items-center overflow-hidden"
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
                <p>Entraînement à <span className="text-magenta font-semibold">Gennevilliers</span></p>
                <p>Matchs en <span className="text-magenta font-semibold">région parisienne</span></p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-elevated border border-white/10">
                <iframe
                  title="Carte — Gennevilliers"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d84044.0441929625!2d2.221!3d48.935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66f5c8c8c8c8b%3A0x0000000000000000!2sGennevilliers!5e0!3m2!1sfr!2sfr!4v1757100498113!5m2!1sfr!2sfr"
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
            <div className="glass rounded-3xl p-6 sm:p-8 reveal-on-scroll hover-lift" style={{ transitionDelay: "300ms" }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/20">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Créneaux
                </h3>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-magenta font-display font-bold mb-2 text-lg">
                    Entraînements
                  </p>
                  <p className="text-white/70 font-sport">
                    Dimanche à 11h • Gennevilliers
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-accent font-display font-bold mb-2 text-lg">
                    Matchs officiels
                  </p>
                  <p className="text-white/70 font-sport">
                    Lundi ou mercredi • Région parisienne
                  </p>
                </div>
              </div>
              <Link
                to="/contacts"
                className="inline-flex items-center gap-2 mt-6 text-magenta hover:text-white font-sport font-medium transition-colors group"
              >
                Plus d'infos sur la page Contacts
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection(photoRef)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-all duration-300 group cursor-pointer p-4"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-8 w-8 animate-bounce" />
        </button>
      </section>

      {/* Photo Gallery Section */}
      <section ref={photoRef} className="py-16 sm:py-24 px-4 sm:px-6 bg-background">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 reveal-on-scroll">
            Galerie photos
          </h2>
          <p className="text-muted-foreground font-sport text-lg mb-8 reveal-on-scroll" style={{ transitionDelay: "100ms" }}>
            Nos meilleurs moments capturés
          </p>

          {photosLoaded && GOOGLE_PHOTOS_ALBUM_SHARE_URL ? (
            <div className="premium-card p-8 sm:p-10 reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
              <p className="text-muted-foreground font-sport mb-4">
                Intégration Google Photos à venir
              </p>
              <p className="text-sm text-muted-foreground/60 font-sport">
                Album URL configuré
              </p>
            </div>
          ) : (
            <div className="premium-card p-8 sm:p-12 reveal-on-scroll" style={{ transitionDelay: "200ms" }}>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <p className="text-muted-foreground font-sport mb-2 text-lg">
                Galerie photos à venir
              </p>
              <p className="text-sm text-muted-foreground/60 font-sport max-w-sm mx-auto">
                Configurez l'URL de l'album Google Photos pour afficher automatiquement vos souvenirs
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-hero relative overflow-hidden">
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
