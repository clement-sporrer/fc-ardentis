import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingBag } from "lucide-react";
import { Seo } from "@/seo/Seo";
import { seoCheckout } from "@/seo/seo.config";

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen">
      <Seo {...seoCheckout("Paiement annulé | FC Ardentis", "/checkout/cancel")} />
      {/* Hero Section */}
      <section 
        data-hero="true"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl" />

        <div className="container max-w-2xl mx-auto relative z-10 text-center pt-16">
          {/* Icon */}
          <div className="mb-8 animate-rise-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
              <XCircle className="h-12 w-12 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4 animate-rise-up"
            style={{ animationDelay: "100ms" }}
          >
            Paiement annulé
          </h1>

          <p 
            className="text-lg text-white/70 font-sport mb-10 max-w-md mx-auto animate-rise-up"
            style={{ animationDelay: "200ms" }}
          >
            Aucun montant n'a été débité. Tu peux retourner au panier pour réessayer ou modifier ta commande.
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-rise-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button asChild variant="magenta" size="xl" className="rounded-full font-display">
              <Link to="/checkout">
                Retour au panier
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl" className="rounded-full font-display">
              <Link to="/shop">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Continuer mes achats
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
