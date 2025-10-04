import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

/** Convertit n'importe quoi en nombre sûr (gère virgule et NaN) */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function Checkout() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();

  // total robuste
  const total = useMemo(() => {
    const items = Array.isArray(state.items) ? state.items : [];
    return items.reduce((sum, it: any) => {
      const price = toNumberSafe(it?.price_eur, 0);
      const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
      return sum + price * qty;
    }, 0);
  }, [state.items]);

  const items = Array.isArray(state.items) ? state.items : [];

  const removeLine = (lineItemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { lineItemId } });
  };

  if (!items.length) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-6">
          Parcourez la boutique et ajoutez des articles personnalisés.
        </p>
        <Button onClick={() => navigate("/shop")}>Aller à la boutique</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Panier</h1>

      <div className="space-y-4">
        {items.map((it: any) => {
          const price = toNumberSafe(it?.price_eur, 0);
          const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
          const lineTotal = price * qty;

          return (
            <Card key={it?.lineItemId || `${it?.id}-${Math.random()}`} className="border-border/10">
              <CardContent className="p-4 flex items-start gap-4">
                <img
                  src={it?.image_url || ""}
                  alt={it?.name || "Produit"}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{it?.name || "Produit"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {it?.size ? <>Taille : {it.size} • </> : null}
                        {it?.number ? <>Numéro : {it.number} • </> : null}
                        {it?.flocage ? <>Flocage : {it.flocage}</> : null}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{price.toFixed(2)}€</div>
                      <div className="text-xs text-muted-foreground">Qté : {qty}</div>
                      <div className="text-xs text-muted-foreground">Sous-total : {lineTotal.toFixed(2)}€</div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/shop")}>
                      Continuer mes achats
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-500"
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
        <div className="text-lg">
          Total : <b>{toNumberSafe(total, 0).toFixed(2)}€</b>
        </div>
        <Button onClick={() => {/* TODO: brancher Stripe ici */}}>
          Passer la commande
        </Button>
      </div>
    </div>
  );
}
