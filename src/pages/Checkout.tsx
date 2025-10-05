import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";

/** Convertit en nombre sûr (gère virgules et NaN) */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export default function Checkout() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  const items = Array.isArray(state.items) ? state.items : [];

  // Total robuste
  const total = useMemo(() => {
    return items.reduce((sum, it: any) => {
      const price = toNumberSafe(it?.price_eur, 0);
      const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
      return sum + price * qty;
    }, 0);
  }, [items]);

  const removeLine = (lineItemId: string) => {
    if (!lineItemId) return;
    dispatch({ type: "REMOVE_ITEM", payload: { lineItemId } });
  };

  const goToDetails = () => {
    // ✅ C’est ça qui te manquait avant : on envoie vers la page d’infos client
    navigate("/checkout/details");
  };

  if (!items.length) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-6">
          Parcourez la boutique et ajoutez des articles personnalisés.
        </p>
        <Button asChild>
          <Link to="/shop">Aller à la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl md:text-4xl font-sport-condensed font-bold mb-6">Panier</h1>

      <div className="space-y-4">
        {items.map((it: any) => {
          const price = toNumberSafe(it?.price_eur, 0);
          const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
          const lineTotal = price * qty;

          return (
            <Card key={it?.lineItemId || `${it?.id}-${Math.random()}`} className="border border-border/20 shadow-card rounded-2xl">
              <CardContent className="p-4 md:p-5 flex items-start gap-4">
                {it?.image_url ? (
                  <img
                    src={it.image_url}
                    alt={it?.name || "Produit"}
                    className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                  />
                ) : null}

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-sport-condensed font-bold text-lg">{it?.name || "Produit"}</h3>
                      <p className="text-sm text-muted-foreground font-sport">
                        {it?.size ? <>Taille : {it.size} • </> : null}
                        {it?.number ? <>Numéro : {it.number} • </> : null}
                        {it?.flocage ? <>Flocage : {it.flocage}</> : null}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="font-sport font-semibold">{price.toFixed(2)}€</div>
                      <div className="text-xs text-muted-foreground font-sport">Qté : {qty}</div>
                      <div className="text-xs text-muted-foreground font-sport">Sous-total : {lineTotal.toFixed(2)}€</div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button asChild variant="outline" className="font-sport">
                      <Link to="/shop">Continuer mes achats</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-500 font-sport"
                      onClick={() => removeLine(String(it?.lineItemId))}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="text-lg font-sport">
          Total : <b>{toNumberSafe(total, 0).toFixed(2)}€</b>
          <div className="text-xs text-muted-foreground font-sport">
            Livraison sous 2 mois • Retrait en main propre auprès du club
          </div>
        </div>
        {/* ✅ Redirection vers la page d’infos client */}
        <Button onClick={goToDetails} className="font-sport bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))] text-white">
          Passer la commande
        </Button>
      </div>
    </div>
  );
}
