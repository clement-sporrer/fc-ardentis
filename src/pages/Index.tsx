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
      {/* Modern Hero Section */}
      <section className="bg-gradient-hero min-h-[85vh] flex items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
        <div className="container max-w-5xl relative z-10">
          <div className="mb-10 animate-fade-in">
            <img 
              src="/assets/logo.png"
              alt="FC Ardentis Logo"
              className="h-36 md:h-48 lg:h-56 w-auto object-contain mx-auto mb-8 drop-shadow-2xl hover-glow"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6 leading-tight">
            Le football,<br />
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">notre fierté locale</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/95 mb-10 font-sport font-medium max-w-4xl mx-auto">
            Club fondé en 2025 • Passion & Excellence • Région parisienne
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in">
            <Button asChild variant="cta" size="lg" className="text-lg px-8 py-4 hover-lift">
              <Link to="/rejoindre">🏆 Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 hover-lift">
              <Link to="/equipe">🌟 Découvrir l'équipe</Link>
            </Button>
          </div>
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
                  📍 Localisation
                </h3>
              </div>
              <p className="text-secondary-foreground/90 font-sport mb-6 text-lg">
                Région parisienne - Île-de-France
              </p>
              <MapboxMap 
                locations={[
                  {
                    name: "Entraînement",
                    address: "1 Allée des Sports, 92800 Puteaux, France",
                    coordinates: [2.238, 48.884],
                    color: "#3b82f6"
                  },
                  {
                    name: "Matchs - Stade Suzanne Lenglen",
                    address: "4 Allée de la Bertelotte, 75015 Paris, France", 
                    coordinates: [2.279, 48.841],
                    color: "#ff6b1a"
                  }
                ]}
                height="h-56"
                zoom={12}
              />
            </div>

            {/* Enhanced Créneaux */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover-lift">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary p-3 rounded-full">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-sport-condensed font-bold text-secondary-foreground">
                  ⏰ Créneaux
                </h3>
              </div>
              <p className="text-secondary-foreground/90 font-sport mb-6 text-lg">
                Entraînements et matchs le mercredi et le dimanche
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-accent font-sport-condensed font-bold mb-1">🏃‍♂️ Entraînements</p>
                  <p className="text-secondary-foreground/80 font-sport">Mercredi 19h-21h • Puteaux</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-accent font-sport-condensed font-bold mb-1">⚽ Matchs</p>
                  <p className="text-secondary-foreground/80 font-sport">Dimanche 15h • Stade Suzanne Lenglen</p>
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
            <Button asChild variant="cta" size="lg" className="text-xl px-10 py-5 hover-lift bg-white text-primary hover:bg-accent hover:text-white">
              <Link to="/rejoindre">🚀 Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-accent/20 backdrop-blur-sm border-2 border-accent text-white hover:bg-accent hover:text-white text-xl px-10 py-5 hover-lift">
              <Link to="/equipe">👥 Rencontrer l'équipe</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;