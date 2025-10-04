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

/** Dégradé violet = cohérent avec vos bandeaux */
const violetGradient =
  "bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]"; // ajustable si besoin

export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();

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

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border/40">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        {/* Logo + nom club */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/assets/logo.png"
            alt="FC Ardentis"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-sport-condensed text-2xl font-bold text-foreground tracking-wide group-hover:text-primary transition-colors">
            FC Ardentis
          </span>
        </Link>

        {/* Liens centraux (style bandeaux : condensed, plus gros, espacés) */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const isActive = location.pathname === link.path
              || (link.path !== "/" && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={[
                  "relative font-sport-condensed",
                  "text-base md:text-lg font-semibold tracking-wider uppercase",
                  "px-3 py-2 rounded-full transition-colors",
                  isActive
                    ? "text-transparent bg-clip-text " + violetGradient
                    : "text-foreground/80 hover:text-foreground"
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {/* CTA Nous rejoindre – dégradé violet, plus visible */}
          <Link to="/rejoindre">
            <Button
              className={[
                "font-sport-condensed text-base md:text-lg font-bold",
                "rounded-full px-6 py-2 text-white border-0 shadow-sm hover:shadow-md transition",
                violetGradient
              ].join(" ")}
            >
              Nous rejoindre
            </Button>
          </Link>

          {/* Panier – style outline cohérent + total safe */}
          <Link to="/checkout">
            <Button
              variant="outline"
              className="font-sport rounded-full border-primary text-primary hover:bg-primary hover:text-white transition px-5"
            >
              🛒 {itemCount} • {totalDisplay}€
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
