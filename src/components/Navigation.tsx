import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

/** Fonction de sécurité pour convertir correctement les nombres (y compris avec des virgules) */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();

  // Calcul propre du total du panier
  const total = useMemo(() => {
    if (!state?.items?.length) return 0;
    return state.items.reduce((sum, item) => {
      const price = toNumberSafe(item?.price_eur, 0);
      const qty = Math.max(1, toNumberSafe(item?.quantity, 1));
      return sum + price * qty;
    }, 0);
  }, [state?.items]);

  const totalDisplay = Number.isFinite(total) ? total.toFixed(2) : "0.00";
  const itemCount = state?.items?.length || 0;

  // Liens du menu principal
  const links = [
    { path: "/", label: "Accueil" },
    { path: "/equipe", label: "Équipe" },
    { path: "/calendrier", label: "Calendrier" },
    { path: "/shop", label: "Boutique" },
    { path: "/contacts", label: "Contacts" },
  ];

  return (
    <header className="w-full bg-[#111111] border-b border-[#222222] sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo à gauche */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="FC Ardentis"
            className="w-8 h-8 rounded-md object-contain"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
          <span className="text-white font-sport text-xl tracking-wide">
            FC Ardentis
          </span>
        </Link>

        {/* Liens centraux */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sport text-sm transition-colors ${
                  isActive
                    ? "text-[#2b7fff]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Boutons à droite */}
        <div className="flex items-center gap-3">
          {/* Bouton "Nous rejoindre" */}
          <Link to="/rejoindre">
            <Button className="font-sport rounded-full bg-gradient-to-r from-[#2b7fff] to-[#55bfff] text-white px-5 py-2 hover:shadow-lg transition">
              Nous rejoindre
            </Button>
          </Link>

          {/* Panier */}
          <Link to="/checkout">
            <Button
              variant="outline"
              className="font-sport rounded-full border-[#2b7fff] text-[#2b7fff] hover:bg-[#2b7fff] hover:text-white transition"
            >
              🛒 {itemCount} • {totalDisplay}€
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
