import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

/** Nombre sûr (gère virgules / NaN) */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();
  const [open, setOpen] = useState(false);
  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Total panier robuste
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

  const links = [
    { path: "/", label: "Accueil" },
    { path: "/equipe", label: "Équipe" },
    { path: "/calendrier", label: "Calendrier" },
    { path: "/shop", label: "Boutique" },
    { path: "/contacts", label: "Contacts" },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
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

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center space-x-8 font-sport text-base font-medium text-foreground">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`hover:text-primary transition ${
                isActive(l.path) ? "text-primary" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ACTIONS DESKTOP */}
        <div className="hidden md:flex items-center space-x-4">
          {/* CTA violet : branché sur les variables de thème */}
          <Link to="/rejoindre">
            <Button className="font-sport px-5 py-2 rounded-full text-white border-0 hover:opacity-90 transition bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))]">
              Nous rejoindre
            </Button>
          </Link>

          <Link to="/checkout">
            <Button
              variant="outline"
              className="font-sport rounded-full px-5 py-2 hover:bg-muted transition"
            >
              🛒 {itemCount} • {totalDisplay}€
            </Button>
          </Link>
        </div>

        {/* BOUTONS MOBILE (burger + panier) */}
        <div className="md:hidden flex items-center gap-2">
          <Link to="/checkout" aria-label="Ouvrir le panier">
            <Button
              variant="outline"
              className="font-sport rounded-full px-4 py-2 hover:bg-muted transition"
            >
              🛒 {itemCount}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="font-sport rounded-full px-3 py-2 hover:bg-muted transition"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {/* Icône burger simple */}
            <span className="block w-5 h-[2px] bg-gray-800 mb-[5px]" />
            <span className="block w-5 h-[2px] bg-gray-800 mb-[5px]" />
            <span className="block w-5 h-[2px] bg-gray-800" />
          </Button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className={`font-sport text-base py-2 ${
                  isActive(l.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* CTA violet aussi en mobile */}
            <Link to="/rejoindre" onClick={() => setOpen(false)}>
              <Button className="w-full font-sport px-5 py-2 rounded-full text-white border-0 hover:opacity-90 transition bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-hover))]">
                Nous rejoindre
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
