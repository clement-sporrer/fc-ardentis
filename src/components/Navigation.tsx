import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toNumberSafe } from "@/lib/utils";
import { Menu, X, ShoppingCart, ChevronRight } from "lucide-react";

/**
 * Navigation with dynamic transparent/solid behavior
 * Uses Intersection Observer to detect hero sections on any page
 */
export default function Navigation() {
  const location = useLocation();
  const { state } = useCart();
  const [open, setOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for hero detection on ANY page
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Small delay to ensure DOM is ready after route change
    const timeout = setTimeout(() => {
      // Look for hero section with dark background
      const heroSection = document.querySelector('[data-hero="true"]') || 
                          document.querySelector('.bg-gradient-hero') ||
                          document.querySelector('section:first-of-type');

      if (heroSection) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            // Check if hero is visible and takes significant viewport space
            const entry = entries[0];
            if (entry) {
              const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1;
              setIsOverHero(isVisible);
            }
          },
          { 
            threshold: [0, 0.1, 0.5], 
            rootMargin: "-64px 0px 0px 0px" // Account for nav height
          }
        );
        observerRef.current.observe(heroSection);
      } else {
        setIsOverHero(false);
      }
    }, 50);

    return () => {
      clearTimeout(timeout);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cart total calculation
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

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path || (path !== "/" && location.pathname.startsWith(path)),
    [location.pathname]
  );

  // Determine if navbar should be transparent
  const showTransparent = isOverHero && !scrolled && !open;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center h-16 lg:h-18 px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 min-h-[48px] min-w-[48px] -ml-2 pl-2 rounded-xl transition-all duration-300 hover:scale-[1.02] group"
        >
          <div className={`relative ${showTransparent ? "drop-shadow-lg" : ""}`}>
            <img
              src="/assets/logo.png"
              alt="FC Ardentis"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span
            className={`font-display text-xl sm:text-2xl font-bold hidden xs:inline transition-colors duration-300 ${
              showTransparent ? "text-white" : "text-foreground"
            }`}
          >
            FC Ardentis
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`relative font-sport text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActive(l.path)
                  ? showTransparent
                    ? "text-white bg-white/20 backdrop-blur-sm"
                    : "text-primary bg-primary/10"
                  : showTransparent
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
            >
              {l.label}
              {isActive(l.path) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-current rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/rejoindre">
            <Button
              variant={showTransparent ? "glass" : "magenta"}
              className="font-sport font-bold px-6 py-2.5 rounded-full"
            >
              Nous rejoindre
            </Button>
          </Link>

          <Link to="/checkout">
            <Button
              variant={showTransparent ? "glass" : "outline"}
              className={`font-sport rounded-full px-5 py-2.5 group ${
                showTransparent ? "" : "hover:bg-primary hover:text-white hover:border-primary"
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold">{itemCount}</span>
              <span
                className={`mx-1.5 ${
                  showTransparent ? "text-white/50" : "text-muted-foreground"
                } group-hover:opacity-70`}
              >
                •
              </span>
              <span className="font-bold">{totalDisplay}€</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Cart Button */}
          <Link to="/checkout" aria-label="Voir le panier">
            <Button
              variant={showTransparent ? "glass" : "outline"}
              size="icon"
              className={`h-12 w-12 rounded-full relative ${
                !showTransparent && "hover:bg-primary hover:text-white hover:border-primary"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Menu Toggle */}
          <Button
            variant={showTransparent ? "glass" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  open ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                }`}
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  open ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                }`}
              />
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 top-16 bg-gradient-to-b from-secondary to-secondary/95 backdrop-blur-xl transition-all duration-500 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="container mx-auto px-6 py-8 flex flex-col h-full">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col gap-2">
            {links.map((l, index) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className={`group flex items-center justify-between font-display text-2xl font-semibold py-4 px-5 rounded-2xl transition-all duration-300 ${
                  isActive(l.path) 
                    ? "text-primary bg-white/10" 
                    : "text-white hover:bg-white/10 hover:text-primary"
                }`}
                style={{
                  transitionDelay: open ? `${index * 75}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateX(0)" : "translateX(-30px)",
                }}
              >
                <span className="flex-1">{l.label}</span>
                <ChevronRight
                  className={`h-5 w-5 transition-all duration-300 flex-shrink-0 ml-3 ${
                    isActive(l.path) 
                      ? "text-primary translate-x-1" 
                      : "text-white/60 group-hover:text-primary group-hover:translate-x-1"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Bottom Actions */}
          <div
            className="pt-6 border-t border-white/10 space-y-4"
            style={{
              transitionDelay: open ? `${links.length * 75}ms` : "0ms",
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.5s ease-out",
            }}
          >
            <Link to="/rejoindre" onClick={() => setOpen(false)}>
              <Button variant="magenta" size="xl" className="w-full font-display text-xl">
                Nous rejoindre
              </Button>
            </Link>

            <Link to="/checkout" onClick={() => setOpen(false)} className="block">
              <Button variant="glass" size="xl" className="w-full font-sport text-lg">
                <ShoppingCart className="h-5 w-5 mr-3" />
                <span>Panier ({itemCount})</span>
                <span className="ml-auto font-bold">{totalDisplay}€</span>
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
