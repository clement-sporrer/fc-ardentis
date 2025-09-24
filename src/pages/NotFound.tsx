import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      <div className="text-center max-w-lg mx-auto relative z-10">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-white mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-4">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-sport-condensed font-bold text-white mb-4">
            Page non trouvée
          </h2>
          <p className="text-lg text-white/90 font-sport mb-8">
            Oops ! La page que vous cherchez n'existe pas. 
            Retournez à l'accueil pour découvrir le FC Ardentis.
          </p>
        </div>
        
        <Button asChild variant="ctaMainWhite" size="lg">
          <Link to="/">
            <Home className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
        
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <Button asChild variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-primary">
            <Link to="/equipe">Notre équipe</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-primary">
            <Link to="/contacts">Contacts</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;