import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

/** Sécurise les nombres avec ou sans virgule */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();

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

  const links = [
    { path: "/", label: "Accueil" },
    { path: "/equipe", label: "Équipe" },
    { path: "/calendrier", label: "Calendrier" },
    { path: "/shop", label: "Boutique" },
    { path: "/contacts", label: "Contacts" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border/40 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        
        {/* Logo FC36 */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/logo.png"
            alt="FC Ardentis"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-sport text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            FC Ardentis
          </span>
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sport-condensed tracking-wide text-sm uppercase transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* CTA "Nous rejoindre" */}
          <Link to="/rejoindre">
            <Button className="font-sport rounded-full bg-gradient-to-r from-[#2b7fff] to-[#55bfff] text-white border-0 px-6 py-2 shadow hover:shadow-md transition">
              Nous rejoindre
            </Button>
          </Link>

          {/* Panier */}
          <Link to="/checkout">
            <Button
              variant="outline"
              className="font-sport rounded-full border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              🛒 {itemCount} • {totalDisplay}€
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
