import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

/** Convertit toute valeur en nombre sûr (gère virgule, NaN) */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Total panier robuste
  const total = useMemo(() => {
    const items = Array.isArray(state?.items) ? state.items : [];
    return items.reduce((sum, it) => {
      const price = toNumberSafe(it?.price_eur, 0);
      const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
      return sum + price * qty;
    }, 0);
  }, [state?.items]);

  const totalDisplay = Number.isFinite(total) ? total.toFixed(2) : "0.00";

  const links = [
    { to: "/", label: "Accueil", match: (p: string) => p === "/" },
    { to: "/equipe", label: "Équipe", match: (p: string) => p.startsWith("/equipe") },
    { to: "/calendrier", label: "Calendrier", match: (p: string) => p.startsWith("/calendrier") },
    { to: "/shop", label: "Boutique", match: (p: string) => p.startsWith("/shop") },
    { to: "/contacts", label: "Contacts", match: (p: string) => p.startsWith("/contacts") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur border-b border-border/20">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Si /logo.svg existe, il s’affichera. Sinon, on garde un fallback texte */}
          <img
            src="/logo.svg"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            alt="FC Ardentis"
            className="h-8 w-8 rounded"
          />
          <span className="text-xl font-bold font-sport group-hover:opacity-90 transition">
            FC Ardentis
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => {
            const active = l.match(location.pathname);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-sport transition hover:text-primary ${
                  active ? "text-primary" : "text-foreground/80"
                }`}
              >
                {l.label}
              </Link>
            );
          })}

          {/* CTA Nous rejoindre */}
          <Link to="/rejoindre">
            <Button className="font-sport rounded-2xl shadow hover:shadow-md transition bg-gradient-to-r from-[#2b7fff] to-[#55bfff] text-white border-0">
              Nous rejoindre
            </Button>
          </Link>

          {/* Panier */}
          <Link to="/checkout">
            <Button variant="outline" className="font-sport rounded-2xl">
              🛒 Panier ({state?.items?.length || 0}) • {totalDisplay}€
            </Button>
          </Link>
        </nav>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-2">
          <Link to="/checkout">
            <Button variant="outline" className="font-sport">
              🛒 {state?.items?.length || 0}
            </Button>
          </Link>
          <Button
            variant="outline"
            className="font-sport"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/20 bg-[#0B0B0B]">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
            {links.map((l) => {
              const active = l.match(location.pathname);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-sport py-1 ${
                    active ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link to="/rejoindre" onClick={() => setMenuOpen(false)}>
              <Button className="w-full font-sport rounded-2xl mt-1 bg-gradient-to-r from-[#2b7fff] to-[#55bfff] text-white border-0">
                Nous rejoindre
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
