import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { toNumberSafe, buildCSVUrl, parseCSVLine, stripBOM } from "@/lib/utils";
import { AlertCircle, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

type ProductType = "maillot" | "short" | "charte";

interface Product {
  id: string;
  name: string;
  type: ProductType;
  price_eur: number;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  size_guide_url: string;
  active: boolean;
  soldout: boolean;
}

const PRODUCTS_CSV_URL = import.meta.env.VITE_SHEET_PRODUCTS_CSV_URL || "";

function ProductCardSkeleton() {
  return (
    <Card className="premium-card overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <Skeleton className="w-full aspect-square rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setErrorMsg(null);
      try {
        const url = buildCSVUrl(PRODUCTS_CSV_URL);
        if (!url) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const res = await fetch(url);
        const raw = stripBOM(await res.text());
        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);

        if (lines.length < 2) {
          setProducts([]);
          return;
        }

        const items: Product[] = lines
          .slice(1)
          .map((line) => {
            const v = parseCSVLine(line, ",");
            if (v.length < 11) return null;

            return {
              id: (v[0] || "").trim().toLowerCase(),
              name: (v[1] || "").trim(),
              type: ((v[2] || "").trim().toLowerCase() as ProductType) || "maillot",
              price_eur: toNumberSafe(v[3], 0),
              image1: v[4] || "",
              image2: v[5] || "",
              image3: v[6] || "",
              image4: v[7] || "",
              size_guide_url: v[8] || "",
              active: (v[9] || "").toLowerCase() === "true",
              soldout: (v[10] || "").toLowerCase() === "true",
            } as Product;
          })
          .filter((p): p is Product => p !== null && p.active && !!p.id);

        setProducts(items);
      } catch (err) {
        console.error(err);
        setErrorMsg("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleImageLoad = (id: string) => {
    setImageLoaded((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-magenta/15 via-transparent to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-magenta/10 rounded-full blur-3xl" />
        
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <ShoppingBag className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Notre</span>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg text-gradient-magenta">Boutique</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-2xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Maillots et shorts officiels du FC Ardentis
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && errorMsg && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <p className="text-destructive font-sport text-lg mb-4">{errorMsg}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="rounded-xl"
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !errorMsg && products.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-sport text-lg">
                Aucun produit disponible pour le moment
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !errorMsg && products.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  className="premium-card overflow-hidden group reveal-on-scroll"
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                    {/* Product Image */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted/30 mb-4">
                      {!imageLoaded[product.id] && (
                        <Skeleton className="absolute inset-0 rounded-2xl" />
                      )}
                      <img
                        src={hoveredProduct === product.id && product.image2 ? product.image2 : product.image1}
                        alt={product.name}
                        loading="lazy"
                        onLoad={() => handleImageLoad(product.id)}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          product.soldout ? "opacity-50 grayscale" : "group-hover:scale-110"
                        } ${imageLoaded[product.id] ? "opacity-100" : "opacity-0"}`}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.soldout ? (
                          <span className="bg-destructive text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            Rupture
                          </span>
                        ) : (
                          <span className="bg-magenta text-magenta-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Officiel
                          </span>
                        )}
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <span className="text-white font-sport text-sm flex items-center gap-2">
                          Voir le produit <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 mb-4">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-foreground line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-display font-bold text-primary">
                        {toNumberSafe(product.price_eur, 0).toFixed(2)}€
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      asChild={!product.soldout}
                      variant={product.soldout ? "outline" : "magenta"}
                      disabled={product.soldout}
                      className={`w-full rounded-xl text-base py-3 ${
                        product.soldout ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {product.soldout ? (
                        <span>Rupture de stock</span>
                      ) : (
                        <Link to={`/shop/${encodeURIComponent(product.id)}`}>
                          Voir le produit
                        </Link>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
