import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();

  // Calcul du total panier sans crash
  const total = useMemo(() => {
    const items = Array.isArray(state?.items) ? state.items : [];
    return items.reduce((sum, item) => {
      const price = toNumberSafe(item?.price_eur, 0);
      const qty = Math.max(1, toNumberSafe(item?.quantity, 1));
      return sum + price * qty;
    }, 0);
  }, [state?.items]);

  const totalDisplay = Number.isFinite(total) ? total.toFixed(2) : "0.00";
  const itemCount = state?.items?.length || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-3 px-6">
        {/* LOGO + NOM */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/assets/logo.png"
            alt="FC Ardentis"
            className="h-10 w-auto object-contain"
          />
          <span className="font-sport text-2xl font-bold text-black">
            FC Ardentis
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center space-x-8 font-sport text-base font-medium text-black">
          <Link
            to="/"
            className={`hover:text-primary ${
              location.pathname === "/" ? "text-primary" : ""
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/equipe"
            className={`hover:text-primary ${
              location.pathname === "/equipe" ? "text-primary" : ""
            }`}
          >
            Équipe
          </Link>
          <Link
            to="/calendrier"
            className={`hover:text-primary ${
              location.pathname === "/calendrier" ? "text-primary" : ""
            }`}
          >
            Calendrier
          </Link>
          <Link
            to="/shop"
            className={`hover:text-primary ${
              location.pathname === "/shop" ? "text-primary" : ""
            }`}
          >
            Boutique
          </Link>
          <Link
            to="/contacts"
            className={`hover:text-primary ${
              location.pathname === "/contacts" ? "text-primary" : ""
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* CTA + PANIER */}
        <div className="flex items-center space-x-4">
          <Link to="/rejoindre">
            <Button className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-sport px-5 py-2 rounded-full hover:opacity-90 transition">
              Nous rejoindre
            </Button>
          </Link>

          <Link to="/checkout">
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-800 font-sport rounded-full px-5 py-2 hover:bg-gray-100 transition"
            >
              🛒 {itemCount} • {totalDisplay}€
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
