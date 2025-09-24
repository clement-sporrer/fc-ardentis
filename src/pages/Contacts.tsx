import React from 'react';
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink, Mail, MapPin, Calendar, Music, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Contacts = () => {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/fc_ardentis/"
    },
    {
      name: "TikTok",
      icon: Music,
      url: "https://www.tiktok.com/@fc_ardentis"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/@fc_ardentis"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10">
        <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6 text-center">
          Nous <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">contacter</span>
        </h1>
        <p className="text-lg text-white/90 font-sport max-w-3xl mx-auto text-center">
          Rejoignez l'aventure FC Ardentis ou posez-nous vos questions
        </p>
        </div>
      </section>

      <div className="container max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Modern Social Networks */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-8">
              Nos <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">réseaux sociaux</span>
            </h2>
            
            <div className="space-y-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-6 p-6 bg-gradient-card rounded-2xl shadow-card border border-border/10 hover-lift group transition-sport"
                >
                  <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-full group-hover:shadow-glow transition-sport">
                    <social.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sport-condensed font-bold text-xl text-foreground mb-1">
                      {social.name}
                    </h3>
                    <p className="text-muted-foreground font-sport">
                      Suivez nos actualités et moments forts
                    </p>
                  </div>
                  <ExternalLink className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-sport" />
                </a>
              ))}
            </div>
          </div>

          {/* Enhanced Contact & Location */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-8">
              Contact <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">direct</span>
            </h2>
            
            {/* Modern Email Card */}
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border/10 hover-lift">
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-full">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-sport-condensed font-bold text-xl text-foreground mb-2">
                    📧 Email
                  </h3>
                  <a 
                    href="mailto:fcardentis@gmail.com"
                    className="text-primary hover:text-accent font-sport font-medium text-lg transition-sport"
                  >
                    fcardentis@gmail.com
                  </a>
                </div>
              </div>
              
              <p className="text-muted-foreground font-sport bg-muted/30 p-4 rounded-xl">
                📞 Pour toute information, écrivez-nous. Réponse garantie sous 48h.
              </p>
            </div>

            {/* Enhanced Location */}
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border/10 hover-lift">
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-gradient-to-br from-accent to-primary p-4 rounded-full">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-sport-condensed font-bold text-xl text-foreground mb-2">
                    📍 Localisation
                  </h3>
                  <p className="text-foreground font-sport font-medium">
                    Région parisienne • Île-de-France
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Enhanced Training Location */}
                <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border border-border/20">
                  <p className="font-sport font-medium text-foreground mb-4">
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">🏃‍♂️ Entraînements :</span><br />
                    Île de Puteaux — 1 Allée des Sports, 92800 Puteaux
                  </p>
                  <div className="rounded-xl overflow-hidden shadow-elevated">
                    <iframe
                      title="Carte Entraînement — Île de Puteaux"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5248.106451911164!2d2.2413660762979415!3d48.876261871334535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66522dca16547%3A0xe1707759fb1ca70e!2s1%20All.%20des%20Sports%2C%2092800%20Puteaux%2C%20France!5e0!3m2!1sfr!2sde!4v1757100498113!5m2!1sfr!2sde"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Schedule */}
            <div className="bg-gradient-card p-8 rounded-2xl shadow-card border border-border/10 hover-lift">
              <div className="flex items-center gap-6 mb-6">
                <div className="bg-gradient-to-br from-accent to-primary p-4 rounded-full">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-sport-condensed font-bold text-xl text-foreground mb-2">
                    ⏰ Infos pratiques
                  </h3>
                  <p className="text-foreground font-sport">
                    Entraînements et matchs
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <p className="text-primary font-sport-condensed font-bold mb-1">🏃‍♂️ Mercredi 19h-21h</p>
                  <p className="text-muted-foreground font-sport text-sm">Entraînements • Puteaux</p>
                </div>
                <div className="bg-accent/10 p-4 rounded-xl border border-accent/20">
                  <p className="text-accent font-sport-condensed font-bold mb-1">⚽ Dimanche 15h</p>
                  <p className="text-muted-foreground font-sport text-sm">Matchs • Stade Suzanne Lenglen</p>
                </div>
              </div>
              
              <Button asChild variant="cta" className="w-full">
                <Link to="/rejoindre">
                  🚀 Nous rejoindre
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
