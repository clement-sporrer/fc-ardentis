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
  
  const removeItem = (lineItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { lineItemId } });
  };
  
  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };
  
  // Calculate total
  const total = state.items.reduce((sum, item) => {
    const price = typeof item.price_eur === 'number' ? item.price_eur : 0;
    const qty = typeof item.quantity === 'number' ? item.quantity : 1;
    return sum + (price * qty);
  }, 0);

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
                  <div key={item.lineItemId} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl animate-fade-in">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="h-16 w-16 object-contain rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-sport-condensed font-bold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground font-sport">
                        {typeof item.price_eur === 'number' ? item.price_eur.toFixed(2) : '0.00'}€
                      </p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground font-sport">Taille: {item.size}</p>
                      )}
                      {item.number && (
                        <p className="text-xs text-muted-foreground font-sport">Numéro: {item.number}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="font-sport-condensed font-bold text-primary">
                        {((item.price_eur || 0) * (item.quantity || 1)).toFixed(2)}€
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Qté: {item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem(item.lineItemId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-sport-condensed font-bold">Total</span>
                  <span className="text-xl font-sport-condensed font-bold text-primary">
                    {total.toFixed(2)}€
                  </span>
                </div>
                <Button onClick={handleCheckout} size="lg" className="w-full font-sport rounded-full text-white border-0 hover:opacity-90 transition bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))]">
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