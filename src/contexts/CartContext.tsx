import { createContext, useContext, useReducer, useEffect } from "react";
import { logger } from "@/lib/logger";

export type CartItem = {
  lineItemId: string;
  id: string;
  name: string;
  price_eur: number;    // nombre
  quantity: number;     // >=1
  image_url?: string;
  size?: string;
  number?: string;
  flocage?: string;
};

export type DeliveryMethod = "hand" | "relay";

export type RelayPoint = {
  id: string;       // ex: "FR-066974"
  name: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  country: string;
};

export type DeliveryInfo = {
  method: DeliveryMethod;
  relay_point?: RelayPoint;
};

type State = { items: CartItem[]; delivery: DeliveryInfo | null };

type Action =
  | { type: "ADD_ITEM"; payload: Partial<CartItem> }
  | { type: "REMOVE_ITEM"; payload: { lineItemId: string } }
  | { type: "CLEAR" }
  | { type: "SET_DELIVERY"; payload: DeliveryInfo }
  | { type: "HYDRATE"; payload: Partial<State> };

const STORAGE_KEY = "fc-ardentis-cart-v2";

function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

const CartContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: { items: [], delivery: null }, dispatch: () => {} });

function reducer(state: State, action: Action): State {
    switch (action.type) {
      case "HYDRATE": {
        const raw = Array.isArray(action.payload?.items) ? action.payload.items : [];
        const items = raw.map((it: unknown) => {
          const item = it as Partial<CartItem>;
          return {
            lineItemId: String(it?.lineItemId ?? `${Date.now()}-${Math.random()}`),
            id: String(it?.id ?? ""),
            name: String(it?.name ?? ""),
            price_eur: toNumberSafe(it?.price_eur, 0),
            quantity: Math.max(1, toNumberSafe(it?.quantity, 1)),
            image_url: it?.image_url ?? "",
            size: it?.size ?? "",
            number: it?.number ?? "",
            flocage: item?.flocage ?? "",
          };
        });
        const rawDelivery = action.payload?.delivery;
        let delivery: DeliveryInfo | null = null;
        if (rawDelivery && typeof rawDelivery === "object" && (rawDelivery.method === "hand" || rawDelivery.method === "relay")) {
          delivery = { method: rawDelivery.method };
          if (rawDelivery.method === "relay" && rawDelivery.relay_point && typeof rawDelivery.relay_point === "object") {
            const rp = rawDelivery.relay_point as Record<string, unknown>;
            delivery.relay_point = {
              id: String(rp.id ?? ""),
              name: String(rp.name ?? ""),
              address1: String(rp.address1 ?? ""),
              address2: String(rp.address2 ?? ""),
              postcode: String(rp.postcode ?? ""),
              city: String(rp.city ?? ""),
              country: String(rp.country ?? ""),
            };
          }
        }
        return { items, delivery };
      }

    case "ADD_ITEM": {
      const p = action.payload ?? {};
      const item: CartItem = {
        lineItemId: `${Date.now()}-${Math.random()}`,
        id: String(p.id ?? ""),
        name: String(p.name ?? ""),
        price_eur: toNumberSafe(p.price_eur, 0),
        quantity: Math.max(1, toNumberSafe(p.quantity, 1)),
        image_url: p.image_url ?? "",
        size: p.size ?? "",
        number: p.number ?? "",
        flocage: p.flocage ?? "",
      };
      if (!item.id || !item.name) return state;
      return { ...state, items: [...state.items, item] };
    }

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.lineItemId !== action.payload.lineItemId) };

    case "SET_DELIVERY":
      return { ...state, delivery: action.payload };

    case "CLEAR":
      return { items: [], delivery: null };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], delivery: null });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      dispatch({ type: "HYDRATE", payload: parsed || {} });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.warn("Failed to persist cart to localStorage:", error);
    }
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
