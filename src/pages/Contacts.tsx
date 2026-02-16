import { Button } from "@/components/ui/button";
import { Instagram, ExternalLink, Mail, MapPin, Calendar, Music, Youtube, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Seo } from "@/seo/Seo";
import { seoContacts } from "@/seo/seo.config";

const Contacts = () => {
  const socialLinks = [
    {
      name: "Instagram",
      handle: "@fc_ardentis",
      icon: Instagram,
      url: "https://www.instagram.com/fc_ardentis/",
      gradient: "from-pink-500 to-purple-600",
    },
    {
      name: "TikTok",
      handle: "@fc_ardentis",
      icon: Music,
      url: "https://www.tiktok.com/@fc_ardentis",
      gradient: "from-gray-900 to-gray-700",
    },
    {
      name: "YouTube",
      handle: "@fc_ardentis",
      icon: Youtube,
      url: "https://youtube.com/@fc_ardentis",
      gradient: "from-red-600 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <Seo {...seoContacts()} />
      {/* Hero Section */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />
        
        <div className="container max-w-5xl mx-auto relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <MessageCircle className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Nous</span>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg text-gradient-magenta">contacter</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-2xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Rejoignez l'aventure FC Ardentis ou posez-nous vos questions
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 bg-gradient-section">
        <div className="container max-w-6xl mx-auto">
          <p className="text-muted-foreground font-sport mb-10 max-w-3xl">
            Pour un essai, une question ou un partenariat, contactez le <span className="font-semibold text-foreground">FC Ardentis</span>.
            Club de football basé en région parisienne.
          </p>

          {/* FAQ (content mirrors FAQPage JSON-LD for better UX + relevance) */}
          <div className="premium-card p-6 sm:p-8 mb-12">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-4">
              Questions fréquentes
            </h2>
            <div className="space-y-4 text-muted-foreground font-sport">
              <div>
                <h3 className="font-display font-bold text-foreground">Comment contacter le FC Ardentis ?</h3>
                <p className="mt-1">
                  Écrivez à{" "}
                  <a className="text-primary underline underline-offset-2" href="mailto:fcardentis@gmail.com">
                    fcardentis@gmail.com
                  </a>{" "}
                  ou contactez-nous via Instagram (@fc_ardentis). Réponse généralement sous 48h.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Où se trouve le FC Ardentis ?</h3>
                <p className="mt-1">
                  Les entraînements ont lieu à <strong>Colombes</strong>. Les détails sont indiqués sur le site et peuvent varier selon la période.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Peut-on venir faire un essai ?</h3>
                <p className="mt-1">
                  Oui. Contactez-nous avec votre profil (poste, expérience, disponibilités) et nous proposerons un créneau.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Social Networks */}
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-8 flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-white" />
                </span>
                Nos réseaux sociaux
              </h2>
              
              <div className="space-y-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 p-5 premium-card group"
                  >
                    <div className={`bg-gradient-to-br ${social.gradient} p-4 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                      <social.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-foreground mb-0.5">
                        {social.name}
                      </h3>
                      <p className="text-muted-foreground font-sport text-sm">
                        {social.handle}
                      </p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-8 flex items-center gap-3">
                <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-magenta to-magenta-dark flex items-center justify-center">
                  <Mail className="h-5 w-5 text-magenta-foreground" />
                </span>
                Contact direct
              </h2>
              
              {/* Email Card */}
              <div className="premium-card p-6 sm:p-8">
                <div className="flex items-start gap-5 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      Email
                    </h3>
                    <a 
                      href="mailto:fcardentis@gmail.com"
                      className="text-primary hover:text-accent font-sport font-semibold text-lg transition-colors inline-flex items-center gap-2 group"
                    >
                      fcardentis@gmail.com
                    </a>
                  </div>
                </div>
                
                <p className="text-muted-foreground font-sport text-sm bg-muted/50 p-4 rounded-xl">
                  Pour toute information, écrivez-nous. Réponse garantie sous 48h.
                </p>
              </div>

              {/* Location Card */}
              <div className="premium-card p-6 sm:p-8">
                <div className="flex items-start gap-5 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20">
                    <MapPin className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      Localisation
                    </h3>
                    <div className="text-foreground/80 font-sport space-y-1">
                      <p>Entraînement à <span className="font-semibold text-foreground">Colombes</span></p>
                      <p>Matchs en <span className="font-semibold text-foreground">région parisienne</span></p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-elevated border border-border/20">
                  <iframe
                    title="Carte — Stade Yves-du-Manoir, Colombes"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2621.270964990178!2d2.2453925762012723!3d48.9292805957155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e665da9e08e561%3A0x65455f9e577c366!2sStade%20Yves-du-Manoir!5e0!3m2!1sfr!2sfr!4v1766965804730!5m2!1sfr!2sfr"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Schedule Card */}
              <div className="premium-card p-6 sm:p-8">
                <div className="flex items-start gap-5 mb-6">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-magenta/20 to-magenta-dark/20">
                    <Calendar className="h-7 w-7 text-magenta" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-2">
                      Horaires
                    </h3>
                    <p className="text-muted-foreground font-sport">
                      Entraînements et matchs
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-primary font-display font-bold mb-0.5">Dimanche 11h</p>
                    <p className="text-muted-foreground font-sport text-sm">Entraînements • Colombes</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-accent font-display font-bold mb-0.5">Lundi ou mercredi</p>
                    <p className="text-muted-foreground font-sport text-sm">Matchs • Région parisienne</p>
                  </div>
                </div>
                
                <Button asChild variant="magenta" size="lg" className="w-full rounded-xl">
                  <Link to="/rejoindre">
                    Nous rejoindre
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contacts;
