import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";

const RELAY_DELIVERY_COST = 5.99;

export function useOrderTotal() {
  const { state } = useCart();

  const subtotal = useMemo(() => {
    return state.items.reduce(
      (sum, item) => sum + item.price_eur * item.quantity,
      0
    );
  }, [state.items]);

  const deliveryCost = useMemo(() => {
    return state.delivery?.method === "relay" ? RELAY_DELIVERY_COST : 0;
  }, [state.delivery]);

  const total = subtotal + deliveryCost;

  return { subtotal, deliveryCost, total };
}
