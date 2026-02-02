import { useCart } from "@/contexts/CartContext";
import type { DeliveryMethod, RelayPoint } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { MondialRelayWidget } from "@/components/MondialRelayWidget";
import { Home, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeliverySelectorProps = {
  submitted?: boolean;
};

export function DeliverySelector({ submitted = false }: DeliverySelectorProps) {
  const { state, dispatch } = useCart();
  const delivery = state.delivery;
  const method = delivery?.method ?? null;
  const relayPoint = delivery?.relay_point ?? null;

  const setDelivery = (info: { method: DeliveryMethod; relay_point?: RelayPoint }) => {
    dispatch({ type: "SET_DELIVERY", payload: info });
  };

  const needsRelayPoint = method === "relay" && !relayPoint;
  const showError = submitted && (!method || needsRelayPoint);

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
          2
        </span>
        Mode de livraison
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setDelivery({ method: "hand" })}
          className={cn(
            "text-left rounded-xl border-2 p-4 transition-all",
            method === "hand"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
          aria-pressed={method === "hand"}
          aria-label="Remise en main propre - 0€"
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                method === "hand" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <Home className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display font-bold text-foreground">Remise en main propre</div>
              <div className="text-sm text-muted-foreground font-sport mt-0.5">Retrait au club</div>
              <div className="font-display font-bold text-primary mt-1">0 €</div>
            </div>
            {method === "hand" && (
              <span className="ml-auto shrink-0 rounded-full bg-primary/20 p-1">
                <Check className="h-4 w-4 text-primary" />
              </span>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDelivery({ method: "relay" })}
          className={cn(
            "text-left rounded-xl border-2 p-4 transition-all",
            method === "relay"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
          aria-pressed={method === "relay"}
          aria-label="Livraison Point Relais - 5,99€"
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                method === "relay" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <MapPin className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="font-display font-bold text-foreground">Point Relais</div>
              <div className="text-sm text-muted-foreground font-sport mt-0.5">
                Points Relais® ou Lockers
              </div>
              <div className="font-display font-bold text-primary mt-1">5,99 €</div>
            </div>
            {method === "relay" && (
              <span className="ml-auto shrink-0 rounded-full bg-primary/20 p-1">
                <Check className="h-4 w-4 text-primary" />
              </span>
            )}
          </div>
        </button>
      </div>

      {showError && (
        <p className="text-sm text-destructive font-sport" role="alert">
          {!method
            ? "Veuillez choisir un mode de livraison."
            : "Veuillez sélectionner un point relais ci-dessous."}
        </p>
      )}

      {method === "relay" && (
        <Card className="rounded-xl border border-border">
          <CardContent className="p-4 pt-4">
            <p className="text-sm text-muted-foreground font-sport mb-2">
              Recherchez par code postal et choisissez votre point relais.
            </p>
            {relayPoint && (
              <div className="mb-4 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                  <div className="text-sm font-sport">
                    <div className="font-display font-bold text-foreground">{relayPoint.name}</div>
                    <div className="text-muted-foreground mt-1">
                      {relayPoint.address1}
                      {relayPoint.address2 ? ` ${relayPoint.address2}` : ""}
                    </div>
                    <div className="text-muted-foreground">
                      {relayPoint.postcode} {relayPoint.city} {relayPoint.country}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <MondialRelayWidget
              onPointSelected={(point) =>
                dispatch({
                  type: "SET_DELIVERY",
                  payload: { method: "relay", relay_point: point ?? undefined },
                })
              }
              selectedPoint={relayPoint}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
