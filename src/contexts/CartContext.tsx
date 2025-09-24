import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface CartItem {
  sku: string;
  name: string;
  variant: 'home' | 'exclusive' | 'keeper';
  quantity: number;
  price_eur: number;
  image_url: string;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { sku: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.sku === action.payload.sku);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.sku === action.payload.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price_eur * item.quantity, 0)
        };
      }
      
      const newItems = [...state.items, { ...action.payload, quantity: 1 }];
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price_eur * item.quantity, 0)
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.sku !== action.payload);
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price_eur * item.quantity, 0)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.sku });
      }
      
      const updatedItems = state.items.map(item =>
        item.sku === action.payload.sku
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price_eur * item.quantity, 0)
      };
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};