import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { Seo } from "@/seo/Seo";
import { seoNotFound } from "@/seo/seo.config";

const NotFound = () => {
  return (
    <div className="min-h-screen">
      <Seo {...seoNotFound()} />
      {/* Hero Section with data-hero for navbar detection */}
      <section 
        data-hero="true"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

        <div className="container max-w-2xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-16">
          {/* Icon */}
          <div className="mb-8 animate-rise-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <AlertTriangle className="h-12 w-12 text-magenta" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="font-display font-bold text-white mb-4 animate-rise-up"
            style={{ animationDelay: "100ms" }}
          >
            <span className="block text-display-lg sm:text-display-xl">404</span>
          </h1>

          <h2 
            className="font-display font-bold text-2xl sm:text-3xl text-white/90 mb-4 animate-rise-up"
            style={{ animationDelay: "150ms" }}
          >
            Page non trouvée
          </h2>

          <p 
            className="text-lg text-white/70 font-sport mb-10 max-w-md mx-auto animate-rise-up"
            style={{ animationDelay: "200ms" }}
          >
            Oops ! La page que vous cherchez n'existe pas. 
            Retournez à l'accueil pour découvrir le FC Ardentis.
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-rise-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button asChild variant="magenta" size="xl" className="rounded-full font-display">
              <Link to="/">
                <Home className="h-5 w-5 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div 
            className="mt-10 flex flex-wrap gap-3 justify-center animate-rise-up"
            style={{ animationDelay: "400ms" }}
          >
            <Button asChild variant="glass" size="lg" className="rounded-full">
              <Link to="/equipe">
                Notre équipe
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="rounded-full">
              <Link to="/contacts">Contacts</Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="rounded-full">
              <Link to="/shop">Boutique</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
