import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, Heart, Trophy, Handshake } from "lucide-react";
import { useEffect, useState } from "react";

// Configuration parameters for easy editing
const GOOGLE_PHOTOS_ALBUM_SHARE_URL = process.env.GOOGLE_PHOTOS_ALBUM_SHARE_URL || "";

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
      {/* Hero Section */}
      <section className="bg-gradient-hero min-h-[80vh] flex items-center justify-center text-center px-4">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/ad48e0e9-aa8d-4228-8e16-a621364627d3.png"
              alt="FC Ardentis Logo"
              className="h-32 md:h-40 w-auto mx-auto mb-6 drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-sport-condensed font-bold text-white mb-6 leading-tight">
            Le football,<br />
            <span className="text-accent">notre fierté locale</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 font-sport">
            Club fondé en 2025, passion et esprit d'équipe
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg">
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-secondary">
              <Link to="/rejoindre">Soutenir le club</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="py-16 px-4 bg-background">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-8">
            Bienvenue au FC Ardentis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12 text-lg font-sport text-foreground/80 leading-relaxed">
            <p>
              Né de la passion commune pour le football, le FC Ardentis rassemble 
              des joueurs de tous niveaux autour des valeurs de respect et d'excellence. 
              Notre club offre un environnement bienveillant pour progresser ensemble.
            </p>
            <p>
              Que vous soyez débutant ou expérimenté, notre équipe vous accueille 
              avec enthousiasme. Rejoignez notre famille sportive et vivez 
              l'aventure collective du football en région parisienne.
            </p>
          </div>

          {/* Valeurs */}
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-card p-6 rounded-lg shadow-card border border-border/20 transition-sport hover:shadow-sport">
                <value.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-sport-condensed font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground font-sport">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infos clés */}
      <section className="py-16 px-4 bg-secondary">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-secondary-foreground text-center mb-12">
            Infos pratiques
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Localisation */}
            <div className="bg-secondary-hover p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-sport-condensed font-bold text-secondary-foreground">
                  Localisation
                </h3>
              </div>
              <p className="text-secondary-foreground/80 font-sport mb-4">
                Région parisienne - Île-de-France
              </p>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-secondary-foreground font-sport italic">
                  🗺️ Mini-carte : Île-de-France (à intégrer)
                </p>
              </div>
            </div>

            {/* Créneaux */}
            <div className="bg-secondary-hover p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-sport-condensed font-bold text-secondary-foreground">
                  Créneaux
                </h3>
              </div>
              <p className="text-secondary-foreground/80 font-sport mb-4">
                Entraînements et matchs le mercredi et le dimanche
              </p>
              <Link 
                to="/contacts" 
                className="text-sm text-primary hover:text-primary-hover font-sport underline transition-sport"
              >
                Plus d'infos sur la page Contacts
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
                Configurez GOOGLE_PHOTOS_ALBUM_SHARE_URL pour afficher automatiquement l'album
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-primary">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-primary-foreground mb-6">
            Envie de jouer ou de soutenir le club ?
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link to="/rejoindre">Nous rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/rejoindre">Soutenir le club</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;