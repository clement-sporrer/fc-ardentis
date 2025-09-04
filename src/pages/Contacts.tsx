import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, MapPin, Calendar, Instagram, Music, Youtube, ExternalLink } from "lucide-react";

const Contacts = () => {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/fc_ardentis/",
      color: "hover:text-pink-500"
    },
    {
      name: "TikTok",
      icon: Music,
      url: "https://www.tiktok.com/@fc_ardentis",
      color: "hover:text-black"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/@fc_ardentis",
      color: "hover:text-red-500"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 px-4 text-center">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6">
            Contacts
          </h1>
          <p className="text-xl text-white/90 font-sport">
            Retrouvez-nous sur nos réseaux et contactez-nous directement
          </p>
        </div>
      </section>

      <div className="container max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Réseaux sociaux */}
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-sport-condensed font-bold text-foreground">
              Nos réseaux sociaux
            </h2>
            
            <div className="space-y-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 p-4 bg-card rounded-lg shadow-card border border-border/20 transition-sport hover:shadow-sport group ${social.color}`}
                >
                  <social.icon className="h-8 w-8 text-muted-foreground group-hover:scale-110 transition-sport" />
                  <div className="flex-1">
                    <h3 className="font-sport-condensed font-bold text-lg text-foreground">
                      {social.name}
                    </h3>
                    <p className="text-muted-foreground font-sport text-sm">
                      Suivez nos actualités
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-sport" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact direct */}
          <div className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-sport-condensed font-bold text-foreground">
              Contact direct
            </h2>
            
            <div className="bg-card p-6 rounded-lg shadow-card border border-border/20">
              <div className="flex items-center gap-4 mb-4">
                <Mail className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-sport-condensed font-bold text-lg text-foreground">
                    Email
                  </h3>
                  <a 
                    href="mailto:fcardentis@gmail.com"
                    className="text-primary hover:text-primary-hover font-sport transition-sport"
                  >
                    fcardentis@gmail.com
                  </a>
                </div>
              </div>
              
              <p className="text-muted-foreground font-sport">
                Pour toute information, écrivez-nous. Réponse sous 48h.
              </p>
            </div>

            {/* Localisation */}
            <div className="bg-card p-6 rounded-lg shadow-card border border-border/20">
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-sport-condensed font-bold text-lg text-foreground">
                    Localisation
                  </h3>
                  <p className="text-foreground font-sport">
                    Région parisienne
                  </p>
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground font-sport italic">
                  🗺️ Mini-carte : Île-de-France (à intégrer)
                </p>
              </div>
            </div>

            {/* Infos pratiques */}
            <div className="bg-card p-6 rounded-lg shadow-card border border-border/20">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-sport-condensed font-bold text-lg text-foreground">
                    Infos pratiques
                  </h3>
                  <p className="text-foreground font-sport">
                    Entraînements et matchs le mercredi et le dimanche
                  </p>
                </div>
              </div>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/rejoindre">
                  Nous rejoindre
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;