import { createContext, useContext, useEffect, useReducer } from "react";

export type CartItem = {
  lineItemId: string;   // id unique de ligne
  id: string;           // slug produit
  name: string;
  price_eur: number;    // nombre (euros)
  quantity?: number;    // par défaut 1
  image_url?: string;
  size?: string;
  number?: string;
  flocage?: string;
};

type CartState = { items: CartItem[] };

type AddPayload = Omit<CartItem, "lineItemId">;

type CartAction =
  | { type: "ADD_ITEM"; payload: AddPayload }
  | { type: "REMOVE_ITEM"; payload: { lineItemId: string } }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: Partial<CartState> };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({ state: { items: [] }, dispatch: () => {} });

const STORAGE_KEY = "fc-ardentis-cart-v2";

function safeNumber(n: any, fallback = 0): number {
  const x = typeof n === "number" ? n : parseFloat(String(n ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE": {
      const incoming = Array.isArray(action.payload?.items)
        ? (action.payload!.items as CartItem[])
        : [];
      const items = incoming.map((it) => ({
        lineItemId: String(it.lineItemId ?? `${Date.now()}-${Math.random()}`),
        id: String(it.id ?? ""),
        name: String(it.name ?? ""),
        price_eur: safeNumber(it.price_eur, 0),
        quantity: safeNumber(it.quantity, 1) || 1,
        image_url: it.image_url ?? "",
        size: it.size ?? "",
        number: it.number ?? "",
        flocage: it.flocage ?? "",
      }));
      return { items };
    }

    case "ADD_ITEM": {
      const lineItemId =
        (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
      const p = action.payload ?? ({} as AddPayload);
      const item: CartItem = {
        lineItemId,
        id: String(p.id ?? ""),
        name: String(p.name ?? ""),
        price_eur: safeNumber(p.price_eur, 0),
        quantity: safeNumber(p.quantity, 1) || 1,
        image_url: p.image_url ?? "",
        size: p.size ?? "",
        number: p.number ?? "",
        flocage: p.flocage ?? "",
      };
      if (!item.id || !item.name) return state; // garde-fou
      return { items: [...state.items, item] };
    }

    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.lineItemId !== action.payload.lineItemId) };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // HYDRATE
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      dispatch({ type: "HYDRATE", payload: parsed || {} });
    } catch (e) {
      console.warn("Cart HYDRATE error → reset", e);
      localStorage.removeItem(STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // PERSIST
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Cart persist error", e);
    }
  }, [state]);

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
