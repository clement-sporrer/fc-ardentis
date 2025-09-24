import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-border/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo et nom */}
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/logo.png" 
              alt="FC Ardentis Logo"
              className="h-10 w-auto opacity-90 drop-shadow-sm"
            />
            <span className="font-sport-condensed font-bold text-lg">
              FC ARDENTIS
            </span>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap items-center justify-center space-x-6 text-sm">
            <Link 
              to="/" 
              className="hover:text-primary transition-sport font-sport"
            >
              Accueil
            </Link>
            <Link 
              to="/equipe" 
              className="hover:text-primary transition-sport font-sport"
            >
              Notre équipe
            </Link>
            <Link 
              to="/contacts" 
              className="hover:text-primary transition-sport font-sport"
            >
              Contacts
            </Link>
            <Link 
              to="/rejoindre" 
              className="hover:text-primary transition-sport font-sport"
            >
              Nous rejoindre
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground font-sport">
            © FC Ardentis 2025
          </div>
        </div>

        {/* Mention légale */}
        <div className="mt-6 pt-4 border-t border-border/10 text-center">
          <p className="text-xs text-muted-foreground font-sport">
            Club de football fondé en 2025 - Région parisienne
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;