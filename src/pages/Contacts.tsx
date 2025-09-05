import React from 'react';
import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink, Mail, MapPin, Calendar, Music, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

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

          {/* Contact direct + Localisation */}
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
              
              <div className="space-y-4">
                {/* Entraînement - Île de Puteaux */}
                <div className="text-sm font-sport text-foreground/80">
                  <p>
                    <strong>Entraînements :</strong><br />
                    Île de Puteaux — 1 Allée des Sports, 92800 Puteaux
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-card">
                  <iframe
                    title="Carte Entraînement — Île de Puteaux"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5248.106451911164!2d2.2413660762979415!3d48.876261871334535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66522dca16547%3A0xe1707759fb1ca70e!2s1%20All.%20des%20Sports%2C%2092800%20Puteaux%2C%20France!5e0!3m2!1sfr!2sde!4v1757100498113!5m2!1sfr!2sde"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                {/* Matchs - Stade Suzanne Lenglen (ajoute ton embed si tu veux afficher aussi le stade) */}
                {/* <div className="text-sm font-sport text-foreground/80">
                  <p>
                    <strong>Matchs :</strong><br />
                    Stade Suzanne Lenglen — 4 Allée de la Bertelotte, 75015 Paris
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-card">
                  <iframe
                    title="Carte Matchs — Stade Suzanne Lenglen"
                    src="https://www.google.com/maps/embed?pb=COLLE_ICI_LE_CODE_EMBED_DU_STADE"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div> */}
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
