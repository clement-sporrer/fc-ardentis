import { useCart } from "@/contexts/CartContext";
import { useOrderTotal } from "@/hooks/useOrderTotal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Trash2, Package } from "lucide-react";
import { toNumberSafe } from "@/lib/utils";
import { Seo } from "@/seo/Seo";
import { seoCheckout } from "@/seo/seo.config";

export default function Checkout() {
  const { state, dispatch } = useCart();
  const { subtotal, deliveryCost, total } = useOrderTotal();
  const navigate = useNavigate();

  const items = Array.isArray(state.items) ? state.items : [];

  const removeLine = (lineItemId: string) => {
    if (!lineItemId) return;
    dispatch({ type: "REMOVE_ITEM", payload: { lineItemId } });
  };

  const goToDetails = () => {
    navigate("/checkout/details");
  };

  if (!items.length) {
    return (
      <div className="min-h-screen">
        <Seo {...seoCheckout("Panier | FC Ardentis", "/checkout")} />
        {/* Hero Section */}
        <section 
          data-hero="true"
          className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-hero"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          
          <div className="container max-w-4xl mx-auto relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-rise-up">
              <ShoppingCart className="h-10 w-10 text-white/70" />
            </div>
            
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
              Votre panier est vide
            </h1>
            
            <p className="text-lg text-white/70 font-sport mb-8 animate-rise-up" style={{ animationDelay: "200ms" }}>
              Parcourez la boutique et ajoutez des articles personnalisés.
            </p>
            
            <Button asChild variant="magenta" size="xl" className="rounded-full font-display animate-rise-up" style={{ animationDelay: "300ms" }}>
              <Link to="/shop">
                <Package className="h-5 w-5 mr-2" />
                Aller à la boutique
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo {...seoCheckout("Panier | FC Ardentis", "/checkout")} />
      {/* Hero Section */}
      <section 
        data-hero="true"
        className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden bg-gradient-hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container max-w-6xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-4 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <ShoppingCart className="h-6 w-6 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-2 animate-rise-up" style={{ animationDelay: "100ms" }}>
            Votre panier
          </h1>
          
          <p className="text-white/70 font-sport animate-rise-up" style={{ animationDelay: "200ms" }}>
            {items.length} article{items.length > 1 ? "s" : ""} • Total: {total.toFixed(2)}€
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-12 bg-gradient-section">
        <div className="container max-w-4xl mx-auto">
          <div className="space-y-4">
            {items.map((it: any) => {
              const price = toNumberSafe(it?.price_eur, 0);
              const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
              const lineTotal = price * qty;

              return (
                <Card key={it?.lineItemId || `${it?.id}-${Math.random()}`} className="premium-card overflow-hidden">
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                    {it?.image_url && (
                      <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0">
                        <img
                          src={it.image_url}
                          alt={it?.name || "Produit"}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-lg text-foreground">{it?.name || "Produit"}</h3>
                          <p className="text-sm text-muted-foreground font-sport mt-1">
                            {it?.size && <span>Taille: {it.size}</span>}
                            {it?.number && <span> • N°{it.number}</span>}
                            {it?.flocage && <span> • {it.flocage}</span>}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-display font-bold text-lg text-primary">{price.toFixed(2)}€</div>
                          <div className="text-xs text-muted-foreground font-sport">Qté: {qty}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="rounded-full font-sport">
                          <Link to="/shop">Continuer mes achats</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full font-sport"
                          onClick={() => removeLine(String(it?.lineItemId))}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="premium-card mt-8">
            <CardContent className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm font-sport">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm font-sport">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>
                    {state.delivery
                      ? state.delivery.method === "relay"
                        ? "5,99 €"
                        : "0 €"
                      : "À choisir à l'étape suivante"}
                  </span>
                </div>
                <div className="flex justify-between font-display font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{total.toFixed(2)} €</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground font-sport">
                  Retrait en main propre ou livraison en point relais sous 60 jours
                  {state.delivery?.method === "relay"
                    ? " • Point Relais"
                    : state.delivery?.method === "hand"
                      ? " • Retrait en main propre"
                      : ""}
                </p>
                <Button
                  onClick={goToDetails}
                  variant="magenta"
                  size="xl"
                  className="w-full sm:w-auto rounded-full font-display"
                >
                  Passer la commande
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
