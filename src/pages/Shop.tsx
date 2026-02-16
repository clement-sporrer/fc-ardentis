import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { toNumberSafe, buildCSVUrl, parseCSVLine, stripBOM, detectCSVDelimiter } from "@/lib/utils";
import { AlertCircle, ShoppingBag, Sparkles, ArrowRight } from "lucide-react";
import { logger } from "@/lib/logger";
import { Seo } from "@/seo/Seo";
import { seoShop } from "@/seo/seo.config";
import { motion } from "framer-motion";

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
  image5: string;
  image6: string;
  image7: string;
  image8: string;
  image9: string;
  image10: string;
  size_guide_url: string;
  active: boolean;
  soldout: boolean;
}

const PRODUCTS_CSV_URL = import.meta.env.VITE_SHEET_PRODUCTS_CSV_URL || "";

function ProductCardSkeleton() {
  return (
    <div className="group">
      <Skeleton className="w-full aspect-[3/4] lg:aspect-[2/3] rounded-2xl mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setErrorMsg(null);
      setLoading(true);
      try {
        const url = buildCSVUrl(PRODUCTS_CSV_URL);
        if (!url) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const res = await fetch(url, { 
          redirect: 'follow',
          cache: 'no-store',
          credentials: 'omit'
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const raw = stripBOM(await res.text());
        if (!raw || raw.trim().length === 0) {
          throw new Error("Réponse vide du serveur");
        }
        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);

        if (lines.length < 2) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const delim = detectCSVDelimiter(lines[0]);
        const items: Product[] = lines.slice(1).map((line) => {
          const v = parseCSVLine(line, delim);
          if (v.length < 17) return null;

          return {
            id: (v[0] || "").trim().toLowerCase(),
            name: (v[1] || "").trim(),
            type: ((v[2] || "").trim().toLowerCase() as ProductType) || "maillot",
            price_eur: toNumberSafe(v[3], 0),
            image1: v[4] || "",
            image2: v[5] || "",
            image3: v[6] || "",
            image4: v[7] || "",
            image5: v[8] || "",
            image6: v[9] || "",
            image7: v[10] || "",
            image8: v[11] || "",
            image9: v[12] || "",
            image10: v[13] || "",
            size_guide_url: v[14] || "",
            active: (v[15] || "").toLowerCase() === "true",
            soldout: (v[16] || "").toLowerCase() === "true",
          } as Product;
        }).filter((p): p is Product => p !== null && p.active && !!p.id);

        setProducts(items);
      } catch (err) {
        logger.error("Erreur chargement produits:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        setErrorMsg(`Impossible de charger les produits. ${errMsg.includes("HTTP") ? errMsg : "Vérifiez la configuration."}`);
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
    <div className="min-h-screen bg-background">
      <Seo {...seoShop()} />
      
      {/* Hero Section - Minimal & Clean */}
      <section data-hero="true" className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-magenta/10 via-transparent to-transparent" />
        
        <div className="container max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-magenta/10 border border-magenta/20 text-magenta text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Collection 2025
              </span>
            </div>
            
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight mb-6">
              Équipement
              <br />
              <span className="text-gradient-magenta">Officiel</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/60 font-sport max-w-xl leading-relaxed">
              Maillots et shorts du FC Ardentis. Personnalisez votre tenue avec flocage et numéro.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 sm:py-24">
        <div className="container max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <p className="text-destructive font-sport text-lg mb-6">{errorMsg}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="rounded-full px-8"
              >
                Réessayer
              </Button>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !errorMsg && products.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-sport text-lg">
                Aucun produit disponible pour le moment
              </p>
            </motion.div>
          )}

          {/* Products Grid */}
          {!loading && !errorMsg && products.length > 0 && (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="group"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <Link 
                    to={product.soldout ? "#" : `/shop/${encodeURIComponent(product.id)}`}
                    className={`block ${product.soldout ? "cursor-not-allowed" : ""}`}
                    onClick={(e) => product.soldout && e.preventDefault()}
                  >
                    {/* Image Container - Responsive Aspect Ratio */}
                    <div className="relative aspect-[3/4] lg:aspect-[2/3] rounded-2xl overflow-hidden bg-muted/30 mb-4">
                      {/* Skeleton while loading */}
                      {!imageLoaded[product.id] && (
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                      )}
                      
                      {/* Main Image */}
                      <img
                        src={product.image1}
                        alt={product.name}
                        loading="lazy"
                        onLoad={() => handleImageLoad(product.id)}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                          product.soldout ? "opacity-40 grayscale" : ""
                        } ${imageLoaded[product.id] ? "opacity-100" : "opacity-0"} ${
                          hoveredProduct === product.id && product.image2 ? "opacity-0" : ""
                        }`}
                      />
                      
                      {/* Hover Image */}
                      {product.image2 && (
                        <img
                          src={product.image2}
                          alt={product.name}
                          loading="lazy"
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                            hoveredProduct === product.id ? "opacity-100 scale-105" : "opacity-0 scale-100"
                          }`}
                        />
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.soldout ? (
                          <span className="bg-black/80 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full">
                            Épuisé
                          </span>
                        ) : (
                          <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Officiel
                          </span>
                        )}
                      </div>

                      {/* Quick View on Hover */}
                      {!product.soldout && (
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                          <div className="bg-white text-black rounded-full py-3 px-4 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-xl">
                            Voir le produit
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="font-display font-semibold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="font-display font-bold text-lg sm:text-xl text-foreground">
                        {toNumberSafe(product.price_eur, 0).toFixed(2)} €
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      {!loading && !errorMsg && products.length > 0 && (
        <section className="py-16 sm:py-24 bg-muted/30">
          <motion.div  
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground mb-4">
              Besoin d'aide pour choisir ?
            </h2>
            <p className="text-muted-foreground font-sport mb-8 max-w-xl mx-auto">
              Consultez notre guide des tailles sur chaque page produit ou contactez-nous pour des conseils personnalisés.
            </p>
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link to="/contacts">Nous contacter</Link>
            </Button>
          </motion.div>
        </section>
      )}
    </div>
  );
}
