import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();

  // total safe
  const total = useMemo(() => {
    if (!Array.isArray(state?.items)) return 0;
    return state.items.reduce((sum, it) => {
      const price = parseFloat(String(it?.price_eur ?? "0").replace(",", "."));
      const qty = Math.max(1, parseFloat(String(it?.quantity ?? "1")));
      if (!Number.isFinite(price) || !Number.isFinite(qty)) return sum;
      return sum + price * qty;
    }, 0);
  }, [state?.items]);

  const totalDisplay = Number.isFinite(total) ? total.toFixed(2) : "0.00";

  return (
    <header className="bg-background border-b border-border/20 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* LOGO */}
        <Link to="/" className="text-xl font-bold font-sport hover:opacity-80 transition">
          FC Ardentis
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex gap-6 text-sm font-sport">
          <Link
            to="/"
            className={`hover:text-primary transition ${
              location.pathname === "/" ? "text-primary" : ""
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/equipe"
            className={`hover:text-primary transition ${
              location.pathname === "/equipe" ? "text-primary" : ""
            }`}
          >
            Équipe
          </Link>
          <Link
            to="/calendrier"
            className={`hover:text-primary transition ${
              location.pathname === "/calendrier" ? "text-primary" : ""
            }`}
          >
            Calendrier
          </Link>
          <Link
            to="/shop"
            className={`hover:text-primary transition ${
              location.pathname.startsWith("/shop") ? "text-primary" : ""
            }`}
          >
            Boutique
          </Link>
          <Link
            to="/contacts"
            className={`hover:text-primary transition ${
              location.pathname === "/contacts" ? "text-primary" : ""
            }`}
          >
            Contacts
          </Link>
        </nav>

        {/* CART SECTION */}
        <div className="flex items-center gap-4">
          <Link to="/checkout">
            <Button variant="outline" className="font-sport">
              🛒 Panier ({state?.items?.length || 0}) • {totalDisplay}€
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
