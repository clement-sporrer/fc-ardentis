import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CartDrawer = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const updateQuantity = (sku: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { sku, quantity } });
  };
  
  const removeItem = (sku: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: sku });
  };
  
  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {state.items.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
              {state.items.reduce((total, item) => total + item.quantity, 0)}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-xl font-sport-condensed font-bold">
            Mon panier ({state.items.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-sport">Votre panier est vide</p>
              <Button asChild variant="default" className="mt-4">
                <Link to="/shop">Voir la boutique</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.sku} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="h-16 w-16 object-contain rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-sport-condensed font-bold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground font-sport">{item.price_eur}€</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-sport-condensed font-bold w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 ml-2"
                          onClick={() => removeItem(item.sku)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-sport-condensed font-bold text-primary">
                      {(item.price_eur * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-sport-condensed font-bold">Total</span>
                  <span className="text-xl font-sport-condensed font-bold text-primary">
                    {state.total.toFixed(2)}€
                  </span>
                </div>
                <Button onClick={handleCheckout} variant="default" size="lg" className="w-full">
                  Finaliser ma commande
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;