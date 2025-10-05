import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const order = params.get("order") || "—";

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-green-600">Paiement réussi 🎉</h1>
      <p className="text-muted-foreground mb-6">
        Merci pour ta commande ! Ton numéro de commande est <b>{order}</b>.<br />
        Tu recevras un reçu de Stripe par email. Le club te contactera pour la remise (sous 2 mois, retrait au club).
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link to="/shop">Retour à la boutique</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/checkout">Voir mon panier</Link>
        </Button>
      </div>
    </div>
  );
}
