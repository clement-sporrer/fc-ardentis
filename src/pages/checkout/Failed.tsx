import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CheckoutFailed() {
  const [params] = useSearchParams();
  const msg = params.get("msg") || "Une erreur est survenue lors du traitement du paiement.";

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-red-600">Erreur de paiement</h1>
      <p className="text-muted-foreground mb-6">
        {msg}
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link to="/checkout">Réessayer</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/shop">Retour à la boutique</Link>
        </Button>
      </div>
    </div>
  );
}
