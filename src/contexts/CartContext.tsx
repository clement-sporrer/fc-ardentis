import { createContext, useContext, useEffect, useReducer } from "react";

type CartItem = {
  lineItemId: string;     // identifiant de ligne unique
  id: string;             // produit (slug)
  name: string;
  price_eur: number;
  quantity: number;       // restera 1 par défaut pour “une ligne = un ajout”
  image_url: string;
  size?: string;
  number?: string;
  flocage?: string;
};

type CartState = {
  items: CartItem[];
};

type AddPayload = Omit<CartItem, "lineItemId">;

type CartAction =
  | { type: "ADD_ITEM"; payload: AddPayload }
  | { type: "REMOVE_ITEM"; payload: { lineItemId: string } }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: CartState };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({ state: { items: [] }, dispatch: () => {} });

const STORAGE_KEY = "fc-ardentis-cart-v2";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "ADD_ITEM": {
      const lineItemId = (globalThis.crypto?.randomUUID?.() ?? Date.now().toString()) + Math.random().toString(16).slice(2);
      const item: CartItem = { lineItemId, ...action.payload };
      return { items: [...state.items, item] };
    }

    case "REMOVE_ITEM":
      return { items: state.items.filter(i => i.lineItemId !== action.payload.lineItemId) };

    case "CLEAR":
      return { items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // hydratation depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartState = JSON.parse(raw);
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persistance
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
