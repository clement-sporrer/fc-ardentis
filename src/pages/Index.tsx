import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Trophy, Handshake, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import MapboxMap from "../components/MapboxMap";

// Configuration parameters for easy editing
const GOOGLE_PHOTOS_ALBUM_SHARE_URL = import.meta.env.VITE_GOOGLE_PHOTOS_ALBUM_SHARE_URL || "";

const Index = () => {
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const valuesRef = useRef<HTMLDivElement>(null);
  const presentationRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  const scrollToPresentation = () => {
    presentationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPhotos = () => {
    photoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Simple check to see if Google Photos album is configured
    if (GOOGLE_PHOTOS_ALBUM_SHARE_URL) {
      setPhotosLoaded(true);
    }

    // Reveal on scroll effect for values
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    const valueCards = valuesRef.current?.querySelectorAll('.value-card');
    valueCards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: Users,
      title: "Cohésion",
      description: "L'esprit d'équipe avant tout"
    },
    {
      icon: Handshake,
      title: "Respect",
      description: "Respect des coéquipiers et adversaires"
    },
    {
      icon: Trophy,
      title: "Performance",
      description: "Excellence sur et en dehors du terrain"
    }
  ];

  return (
    <>
      {/* Modern Hero Section - Full Space minus navbar (~64px) */}
      <section className="bg-gradient-hero px-4 md:px-6 text-center relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10 flex flex-col items-center justify-center py-12 md:py-0">
          <div className="animate-fade-in flex flex-col items-center">
            <img 
              src="/assets/logo.png"
              alt="FC Ardentis Logo"
              className="h-32 md:h-48 w-auto object-contain mx-auto mb-4 drop-shadow-2xl animate-float"
            />
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-sport-condensed font-bold text-white leading-tight mb-2">
              FC Ardentis
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-sport font-medium mb-8 md:mb-10">
              Since 2025
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-5 justify-center mb-8 md:mb-12 w-full max-w-md sm:max-w-none">
            <Button asChild size="lg" className="font-sport rounded-full text-white text-lg md:text-xl px-10 md:px-14 py-5 md:py-6 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))] hover-lift">
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-sport rounded-full border-2 border-white text-white hover:bg-white hover:text-primary text-lg md:text-xl px-10 md:px-14 py-5 md:py-6 hover-lift transition-sport">
              <Link to="/equipe">Découvrir l'équipe</Link>
            </Button>
          </div>
          <p className="text-sm md:text-base lg:text-lg text-white/70 font-sport max-w-2xl mx-auto mt-2 px-4">
            Membres de la Commission de Football Loisir (<a href="https://www.cflparis.fr/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white underline font-bold transition-sport">CFL</a> — compétition parisienne)
          </p>
          
          {/* Navigation Arrow */}
          <button
            onClick={scrollToPresentation}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors animate-bounce cursor-pointer group"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-10 w-10 md:h-12 md:w-12 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </section>

      {/* Modern Presentation */}
      <section ref={presentationRef} className="min-h-[calc(100vh-64px)] py-16 md:py-20 px-4 md:px-6 bg-gradient-section relative flex items-center">
        <div className="container max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-sport-condensed font-bold text-foreground mb-10 md:mb-12 leading-tight animate-fade-in">
            Bienvenue au <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FC Ardentis</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16 text-base md:text-lg lg:text-xl font-sport text-foreground/80 leading-relaxed max-w-5xl mx-auto">
            <div className="bg-gradient-card p-6 md:p-8 rounded-2xl shadow-card hover-lift animate-slide-in-right">
              <p>
                Né de la passion commune pour le football, le FC Ardentis rassemble 
                des joueurs de tous niveaux autour des valeurs de respect et d'excellence. 
                Notre club offre un environnement bienveillant pour progresser ensemble.
              </p>
            </div>
            <div className="bg-gradient-card p-6 md:p-8 rounded-2xl shadow-card hover-lift animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <p>
                Que vous soyez débutant ou expérimenté, notre équipe vous accueille 
                avec enthousiasme. Rejoignez notre famille sportive et vivez 
                l'aventure collective du football en région parisienne.
              </p>
            </div>
          </div>

          {/* Modern Values Cards with Reveal Effect */}
          <div ref={valuesRef} className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={value.title} 
                className="value-card reveal-on-scroll bg-gradient-card p-8 rounded-2xl shadow-card border border-border/10 hover-lift group"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:shadow-glow group-hover:animate-float transition-sport">
                  <value.icon className="h-12 w-12 text-white mx-auto" />
                </div>
                <h3 className="text-2xl font-sport-condensed font-bold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground font-sport text-lg">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation Arrow */}
        <button
          onClick={scrollToInfo}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/60 hover:text-foreground transition-colors animate-bounce cursor-pointer group"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-10 w-10 md:h-12 md:w-12 group-hover:scale-110 transition-transform" />
        </button>
      </section>

      {/* Modern Info Section */}
      <section ref={infoRef} className="min-h-[calc(100vh-64px)] py-16 md:py-20 px-4 md:px-6 bg-gradient-hero-alt relative flex items-center">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-sport-condensed font-bold text-secondary-foreground text-center mb-12 md:mb-16 animate-fade-in">
            Infos <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">pratiques</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {/* Enhanced Localisation */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover-lift">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-accent p-3 rounded-full">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-sport-condensed font-bold text-secondary-foreground">
                  Localisation
                </h3>
              </div>
              <div className="text-left md:text-center text-secondary-foreground/90 font-sport mb-6 text-lg space-y-1">
                <p>Entraînement à Gennevilliers.</p>
                <p>Match lundi ou mercredi en région parisienne.</p>
              </div>
              <div className="rounded-xl overflow-hidden shadow-elevated">
                <iframe
                  title="Carte — Gennevilliers"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d84044.0441929625!2d2.221!3d48.935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66f5c8c8c8c8b%3A0x0000000000000000!2sGennevilliers!5e0!3m2!1sfr!2sfr!4v1757100498113!5m2!1sfr!2sfr"
                  width="100%"
                  height="240"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Enhanced Créneaux */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover-lift">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary p-3 rounded-full">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-sport-condensed font-bold text-secondary-foreground">
                  Créneaux
                </h3>
              </div>
              {/* Removed duplicate description to avoid redundancy */}
              <div className="space-y-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <p className="text-accent font-sport-condensed font-bold mb-1">Entraînements</p>
                  <p className="text-secondary-foreground/80 font-sport">Dimanche 11h • Gennevilliers</p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                  <p className="text-accent font-sport-condensed font-bold mb-1">Matchs</p>
                  <p className="text-secondary-foreground/80 font-sport">Lundi ou mercredi • Région parisienne</p>
                </div>
              </div>
              <Link 
                to="/contacts" 
                className="inline-block mt-6 text-accent hover:text-primary font-sport font-medium underline transition-sport"
              >
                Plus d'infos sur la page Contacts →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Navigation Arrow */}
        <button
          onClick={scrollToPhotos}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-secondary-foreground/60 hover:text-secondary-foreground transition-colors animate-bounce cursor-pointer group"
          aria-label="Scroll to next section"
        >
          <ChevronDown className="h-10 w-10 md:h-12 md:w-12 group-hover:scale-110 transition-transform" />
        </button>
      </section>

      {/* Galerie photos */}
      <section ref={photoRef} className="py-16 px-4 bg-background">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-8">
            Galerie photos
          </h2>
          
          {photosLoaded && GOOGLE_PHOTOS_ALBUM_SHARE_URL ? (
            <div className="bg-card p-8 rounded-lg shadow-card border border-border/20">
              <p className="text-muted-foreground font-sport mb-4">
                Intégration Google Photos à venir
              </p>
              <p className="text-sm text-muted-foreground font-sport">
                Album URL configuré : {GOOGLE_PHOTOS_ALBUM_SHARE_URL.substring(0, 50)}...
              </p>
            </div>
          ) : (
            <div className="bg-card p-8 rounded-lg shadow-card border border-border/20">
              <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground font-sport mb-2">
                Galerie photos à venir
              </p>
              <p className="text-sm text-muted-foreground font-sport">
                Configurez VITE_GOOGLE_PHOTOS_ALBUM_SHARE_URL pour afficher automatiquement l'album
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-sport-condensed font-bold text-primary-foreground mb-6 md:mb-8 leading-tight animate-fade-in">
            Prêt à rejoindre<br />
            <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">l'aventure ?</span>
          </h2>
          
          <p className="text-base md:text-lg text-white/90 mb-10 md:mb-12 font-sport max-w-3xl mx-auto px-4 animate-fade-in">
            Que vous souhaitiez jouer, soutenir ou simplement découvrir notre club,
            nous vous accueillons avec passion !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 md:gap-6 justify-center w-full max-w-md sm:max-w-none mx-auto px-4">
            <Button asChild variant="ctaMainWhite" size="lg" className="text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 hover-lift">
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg md:text-xl px-8 md:px-10 py-4 md:py-5 hover-lift transition-sport">
              <Link to="/equipe">Rencontrer l'équipe</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;