import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Trophy, Handshake } from "lucide-react";
import { useEffect, useState } from "react";
import MapboxMap from "../components/MapboxMap";

// Configuration parameters for easy editing
const GOOGLE_PHOTOS_ALBUM_SHARE_URL = import.meta.env.VITE_GOOGLE_PHOTOS_ALBUM_SHARE_URL || "";

const Index = () => {
  const [photosLoaded, setPhotosLoaded] = useState(false);

  useEffect(() => {
    // Simple check to see if Google Photos album is configured
    if (GOOGLE_PHOTOS_ALBUM_SHARE_URL) {
      setPhotosLoaded(true);
    }
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
      <section className="bg-gradient-hero px-4 text-center relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10 flex flex-col items-center justify-center">
          <div className="animate-fade-in flex flex-col items-center">
            <img 
              src="/assets/logo.png"
              alt="FC Ardentis Logo"
              className="h-36 md:h-48 w-auto object-contain mx-auto mb-4 drop-shadow-2xl"
            />
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-sport-condensed font-bold text-white leading-tight mb-2">
              FC Ardentis
            </h1>
            <p className="text-2xl md:text-3xl text-white/80 font-sport font-medium mb-10">
              Since 2025
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
            <Button asChild size="lg" className="font-sport rounded-full text-white px-10 py-5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))]">
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-sport rounded-full border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-5">
              <Link to="/equipe">Découvrir l'équipe</Link>
            </Button>
          </div>
          <p className="text-base md:text-lg text-white/70 font-sport max-w-2xl mx-auto mt-2">
            Membres de la Commission de Football Loisir (<a href="https://www.cflparis.fr/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white underline font-bold">CFL</a> — compétition parisienne)
          </p>
        </div>
      </section>

      {/* Modern Presentation */}
      <section className="py-20 px-4 bg-gradient-section">
        <div className="container max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-12 leading-tight">
            Bienvenue au<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FC Ardentis</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16 text-xl font-sport text-foreground/80 leading-relaxed max-w-5xl mx-auto">
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card hover-lift">
              <p>
                Né de la passion commune pour le football, le FC Ardentis rassemble 
                des joueurs de tous niveaux autour des valeurs de respect et d'excellence. 
                Notre club offre un environnement bienveillant pour progresser ensemble.
              </p>
            </div>
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card hover-lift">
              <p>
                Que vous soyez débutant ou expérimenté, notre équipe vous accueille 
                avec enthousiasme. Rejoignez notre famille sportive et vivez 
                l'aventure collective du football en région parisienne.
              </p>
            </div>
          </div>

          {/* Modern Values Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={value.title} className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border/10 hover-lift group">
                <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-full w-20 h-20 mx-auto mb-6 group-hover:shadow-glow transition-sport">
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
      </section>

      {/* Modern Info Section */}
      <section className="py-20 px-4 bg-gradient-hero-alt">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-secondary-foreground text-center mb-16">
            Infos <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">pratiques</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-10">
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
      </section>

      {/* Galerie photos */}
      <section className="py-16 px-4 bg-background">
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
      <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-primary-foreground mb-8 leading-tight">
            Prêt à rejoindre<br />
            <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">l'aventure ?</span>
          </h2>
          
          <p className="text-lg text-white/90 mb-12 font-sport max-w-3xl mx-auto">
            Que vous souhaitiez jouer, soutenir ou simplement découvrir notre club,
            nous vous accueillons avec passion !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild variant="ctaMainWhite" size="lg" className="text-xl px-10 py-5 hover-lift">
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-primary text-xl px-10 py-5 hover-lift">
              <Link to="/equipe">Rencontrer l'équipe</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;