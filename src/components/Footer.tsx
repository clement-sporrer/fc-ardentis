import { Link } from 'react-router-dom';
import { MapPin, Calendar, Mail, Users, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: "/", label: "Accueil" },
    { path: "/equipe", label: "Notre équipe" },
    { path: "/calendrier", label: "Calendrier" },
    { path: "/shop", label: "Boutique" },
  ];

  const aboutLinks = [
    { path: "/contacts", label: "Nous contacter" },
    { path: "/rejoindre", label: "Nous rejoindre" },
  ];

  return (
    <footer className="bg-gradient-to-b from-secondary to-secondary/95 text-secondary-foreground relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group mb-6">
              <img 
                src="/assets/logo.png" 
                alt="FC Ardentis Logo"
                className="h-12 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-display font-bold text-2xl text-white group-hover:text-gold transition-colors duration-300">
                FC ARDENTIS
              </span>
            </Link>
            <p className="text-white/70 font-sport text-sm leading-relaxed mb-6 max-w-xs">
              Club de football fondé en 2025 en région parisienne. 
              Passion, cohésion et excellence sur le terrain.
            </p>
            
            {/* CFL Badge */}
            <a
              href="https://www.cflparis.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-300 group"
            >
              <span className="text-xs font-sport font-medium text-white/80">Membre CFL Paris</span>
              <ArrowRight className="h-3 w-3 text-gold group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-5 flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              Navigation
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="font-sport text-white/70 hover:text-gold transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-gold group-hover:w-3 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-5 flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              À propos
            </h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="font-sport text-white/70 hover:text-accent transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-accent group-hover:w-3 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Column */}
          <div>
            <h3 className="font-display font-bold text-lg text-white mb-5 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Infos pratiques
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <MapPin className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-white/90 font-sport text-sm font-medium">Localisation</p>
                  <p className="text-white/60 font-sport text-xs">Gennevilliers, Île-de-France</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-white/90 font-sport text-sm font-medium">Entraînements</p>
                  <p className="text-white/60 font-sport text-xs">Dimanche 11h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50 font-sport">
              © {currentYear} FC Ardentis. Tous droits réservés.
            </p>
            
            <p className="text-xs text-white/40 font-sport flex items-center gap-1.5">
              Créé avec 
              <span className="text-accent">♥</span> 
              par{' '}
              <a
                href="https://linkedin.com/in/clementsporrer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-gold transition-colors underline-offset-2 hover:underline font-medium"
              >
                Clément Sporrer
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
