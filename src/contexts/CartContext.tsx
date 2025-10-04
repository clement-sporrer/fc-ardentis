import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";

interface CartItem {
  lineItemId: string;
  id: string;
  name: string;
  price_eur: number;
  quantity: number;
  image_url?: string;
  size?: string;
  number?: string;
  flocage?: string;
}

type State = { items: CartItem[] };
type Action =
  | { type: "ADD_ITEM"; payload: Partial<CartItem> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR" };

const CartContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_ITEM": {
      console.log("🧩 CartContext reçoit payload :", action.payload);
      const p = action.payload ?? {};
      const safePrice = Number.isFinite(p.price_eur)
        ? p.price_eur
        : parseFloat(String(p.price_eur || "0").replace(",", "."));
      const item: CartItem = {
        lineItemId: `${Date.now()}-${Math.random()}`,
        id: String(p.id || ""),
        name: String(p.name || ""),
        price_eur: Number.isFinite(safePrice) ? safePrice : 0,
        quantity: p.quantity || 1,
        image_url: p.image_url || "",
        size: p.size || "",
        number: p.number || "",
        flocage: p.flocage || "",
      };
      console.log("🧩 CartContext construit item final :", item);
      return { items: [...state.items, item] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.lineItemId !== action.payload) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { items: [] }, () => {
    const stored = localStorage.getItem("fc-ardentis-cart-v2");
    return stored ? JSON.parse(stored) : { items: [] };
  });
  useEffect(() => {
    localStorage.setItem("fc-ardentis-cart-v2", JSON.stringify(state));
  }, [state]);
  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
