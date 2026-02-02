import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import { Seo } from "@/seo/Seo";
import { seoCheckout } from "@/seo/seo.config";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const order = params.get("order") || "—";
  const { dispatch } = useCart();

  // Clear cart on successful payment
  useEffect(() => {
    dispatch({ type: "CLEAR_CART" });
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <Seo {...seoCheckout("Paiement réussi | FC Ardentis", "/checkout/success")} />
      {/* Hero Section */}
      <section 
        data-hero="true"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

        <div className="container max-w-2xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-16">
          {/* Icon */}
          <div className="mb-8 animate-rise-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-4 animate-rise-up"
            style={{ animationDelay: "100ms" }}
          >
            Paiement réussi 🎉
          </h1>

          <p 
            className="text-lg text-white/70 font-sport mb-4 animate-rise-up"
            style={{ animationDelay: "200ms" }}
          >
            Merci pour ta commande !
          </p>

          {/* Order ID */}
          <div 
            className="inline-block px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-rise-up"
            style={{ animationDelay: "250ms" }}
          >
            <p className="text-sm text-white/60 font-sport">Numéro de commande</p>
            <p className="font-display font-bold text-xl text-white">{order}</p>
          </div>

          <p 
            className="text-white/60 font-sport mb-10 max-w-md mx-auto animate-rise-up"
            style={{ animationDelay: "300ms" }}
          >
            Tu recevras un reçu de Stripe par email. Le club te contactera pour la remise 
            (sous 60 jours, retrait au club ou livraison en point relais).
          </p>

          {/* CTAs */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-rise-up"
            style={{ animationDelay: "400ms" }}
          >
            <Button asChild variant="magenta" size="xl" className="rounded-full font-display">
              <Link to="/shop">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Retour à la boutique
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl" className="rounded-full font-display">
              <Link to="/">
                <Package className="h-5 w-5 mr-2" />
                Accueil
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
