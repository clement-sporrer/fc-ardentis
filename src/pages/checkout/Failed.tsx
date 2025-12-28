import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShoppingBag, RefreshCw } from "lucide-react";

export default function CheckoutFailed() {
  const [params] = useSearchParams();
  const msg = params.get("msg") || "Une erreur est survenue lors du traitement du paiement.";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        data-hero="true"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />

        <div className="container max-w-2xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-16">
          {/* Icon */}
          <div className="mb-8 animate-rise-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30">
              <AlertCircle className="h-12 w-12 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4 animate-rise-up"
            style={{ animationDelay: "100ms" }}
          >
            Erreur de paiement
          </h1>

          <p 
            className="text-lg text-white/70 font-sport mb-10 max-w-md mx-auto animate-rise-up"
            style={{ animationDelay: "200ms" }}
          >
            {msg}
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-rise-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button asChild variant="magenta" size="xl" className="rounded-full font-display">
              <Link to="/checkout">
                <RefreshCw className="h-5 w-5 mr-2" />
                Réessayer
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl" className="rounded-full font-display">
              <Link to="/shop">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Retour à la boutique
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
