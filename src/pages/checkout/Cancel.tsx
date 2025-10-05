import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  return (
    <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-yellow-600">Paiement annulé</h1>
      <p className="text-muted-foreground mb-6">
        Aucun montant n’a été débité. Tu peux retourner au panier pour réessayer ou modifier ta commande.
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link to="/checkout">Retour au panier</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/shop">Continuer mes achats</Link>
        </Button>
      </div>
    </div>
  );
}
