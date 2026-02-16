import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Check, Ruler, Package, AlertCircle, ChevronLeft, ChevronRight, ArrowLeft, Minus, Plus, Truck } from "lucide-react";
import { toNumberSafe, stripBOM, parseCSVLine, detectCSVDelimiter } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { Seo } from "@/seo/Seo";
import { seoProduct } from "@/seo/seo.config";
import { motion, AnimatePresence } from "framer-motion";

type ProductType = "maillot" | "short";

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

function buildCsvUrl() {
  let base =
    (import.meta as any).env?.VITE_SHEET_PRODUCTS_CSV_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL ||
    "";
  try { base = decodeURIComponent(base); } catch (error) {
    logger.warn("Failed to decode URI component:", error);
  }
  base = base.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  return base + (base.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
}

const SIZES = ["3XS", "2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = decodeURIComponent((slug || "").trim().toLowerCase());
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [size, setSize] = useState("");
  const [number, setNumber] = useState("");
  const [flocage, setFlocage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [openAdded, setOpenAdded] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageDirection, setImageDirection] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      setErrorMsg(null);
      setLoading(true);
      try {
        const res = await fetch(buildCsvUrl(), { 
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

        const delim = detectCSVDelimiter(lines[0]);
        const list: Product[] = lines.slice(1).map((line) => {
          const v = parseCSVLine(line, delim);
          if (v.length < 17) return null;

          return {
            id: (v[0] || "").trim().toLowerCase(),
            name: (v[1] || "").trim(),
            type: ((v[2] || "").trim().toLowerCase() as ProductType) || "maillot",
            price_eur: toNumberSafe((v[3] || "0"), 0),
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
        }).filter(Boolean) as Product[];

        const found = list.find((p) => (p.id || "").toLowerCase() === safeSlug);
        setProduct(found || null);
      } catch (e: any) {
        logger.error("Erreur chargement produit:", e);
        const errMsg = e instanceof Error ? e.message : String(e);
        setErrorMsg(`Impossible de charger ce produit. ${errMsg.includes("HTTP") ? errMsg : "Vérifiez la configuration."}`);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [safeSlug]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!size) return alert("Choisis ta taille !");

    for (let i = 0; i < quantity; i++) {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: product.id,
          name: product.name,
          price_eur: toNumberSafe(product.price_eur, 0),
          quantity: 1,
          image_url: product.image1,
          size,
          number,
          flocage,
        },
      });
    }

    setOpenAdded(true);
  };

  const images = product
    ? [
        product.image1,
        product.image2,
        product.image3,
        product.image4,
        product.image5,
        product.image6,
        product.image7,
        product.image8,
        product.image9,
        product.image10,
      ].filter(Boolean)
    : [];

  const nextImage = () => {
    setImageDirection(1);
    setSelectedImage((i) => (i >= images.length - 1 ? 0 : i + 1));
  };

  const prevImage = () => {
    setImageDirection(-1);
    setSelectedImage((i) => (i <= 0 ? images.length - 1 : i - 1));
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Seo {...seoProduct({ id: safeSlug, name: "Produit" })} />
        <div className="container max-w-7xl mx-auto pt-24 sm:pt-32 pb-16">
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <Skeleton className="aspect-[2/3] rounded-3xl" />
            <div className="space-y-6 py-8">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-background">
        <Seo {...seoProduct({ id: safeSlug, name: "Produit" })} />
        <div className="container max-w-2xl mx-auto text-center pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">{errorMsg}</h1>
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la boutique
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Seo {...seoProduct({ id: safeSlug, name: "Produit" })} />
        <div className="container max-w-2xl mx-auto text-center pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-display font-bold text-2xl text-foreground mb-4">Produit introuvable</h1>
            <Button asChild variant="outline" className="rounded-full px-8">
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la boutique
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo {...seoProduct({ id: product.id, name: product.name, price_eur: product.price_eur, image1: product.image1, soldout: product.soldout })} />
      
      <div className="container max-w-7xl mx-auto pt-24 sm:pt-32 pb-16 sm:pb-24">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-sport text-sm transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour à la boutique
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-4 flex flex-col items-center lg:items-start"
          >
            {/* Main Image - Responsive Aspect Ratio */}
            <div className="relative w-full max-w-md lg:max-w-none aspect-[3/4] lg:aspect-[2/3] max-h-[70vh] lg:max-h-none rounded-3xl overflow-hidden bg-muted/30 group">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  initial={{ opacity: 0, x: imageDirection * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: imageDirection * -50 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 focus:opacity-100 focus:outline-none"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="h-6 w-6 text-black" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 focus:opacity-100 focus:outline-none"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="h-6 w-6 text-black" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setImageDirection(i > selectedImage ? 1 : -1);
                          setSelectedImage(i);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedImage === i 
                            ? "w-8 bg-white" 
                            : "w-2 bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Soldout Overlay */}
              {product.soldout && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-black font-display font-bold text-lg px-6 py-3 rounded-full">
                    Épuisé
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center lg:justify-start w-full max-w-md lg:max-w-none">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImageDirection(i > selectedImage ? 1 : -1);
                      setSelectedImage(i);
                    }}
                    className={`shrink-0 w-20 h-28 rounded-xl overflow-hidden transition-all duration-300 ${
                      selectedImage === i
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:py-8 flex flex-col items-center lg:items-start"
          >
            <div className="sticky top-28 space-y-8 w-full max-w-md lg:max-w-none">
              {/* Title & Price */}
              <div className="text-center lg:text-left">
                <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-4">
                  {product.name}
                </h1>
                <p className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                  {Number(toNumberSafe(product.price_eur, 0)).toFixed(2)} €
                </p>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-sport font-medium text-foreground">Taille</label>
                  <button
                    type="button"
                    onClick={() => setOpenGuide(true)}
                    className="text-muted-foreground text-sm font-sport hover:text-foreground transition-colors flex items-center gap-1.5 underline underline-offset-4"
                  >
                    <Ruler className="h-4 w-4" />
                    Guide des tailles
                  </button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-sport">⚠️ Nos articles taillent petit, prenez une taille au-dessus</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-3 px-2 rounded-xl font-sport text-sm transition-all duration-200 ${
                        size === s
                          ? "bg-foreground text-background ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Fields */}
              {product.type === "maillot" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-sport font-medium text-foreground block">
                      Numéro de maillot <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </label>
                    <Input
                      placeholder="Ex: 10"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="rounded-xl h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-sport font-medium text-foreground block">
                      Flocage <span className="text-muted-foreground font-normal">(optionnel)</span>
                    </label>
                    <Input
                      placeholder="Ex: MBAPPÉ"
                      value={flocage}
                      onChange={(e) => setFlocage(e.target.value)}
                      className="rounded-xl h-12 text-base"
                    />
                  </div>
                </div>
              )}

              {product.type === "short" && (
                <div className="space-y-2">
                  <label className="font-sport font-medium text-foreground block">
                    Numéro <span className="text-muted-foreground font-normal">(optionnel)</span>
                  </label>
                  <Input
                    placeholder="Ex: 7"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="rounded-xl h-12 text-base"
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <label className="font-sport font-medium text-foreground block">Quantité</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-xl border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-12 w-12 flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="h-12 w-12 flex items-center justify-center font-display font-bold text-lg border-x border-border">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-12 w-12 flex items-center justify-center hover:bg-muted transition-colors"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={product.soldout || !size}
                variant="magenta"
                size="xl"
                className="w-full rounded-xl h-14 text-lg font-display"
              >
                {product.soldout ? (
                  "Épuisé"
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Ajouter au panier — {(Number(toNumberSafe(product.price_eur, 0)) * quantity).toFixed(2)} €
                  </>
                )}
              </Button>

              {/* Delivery Info */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50">
                <Truck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm font-sport text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Livraison</p>
                  <p>Retrait en main propre ou livraison en point relais sous 60 jours après la commande.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <Dialog open={openGuide} onOpenChange={setOpenGuide}>
        <DialogContent className="max-w-3xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Guide des tailles</DialogTitle>
            <DialogDescription className="text-muted-foreground font-sport">
              Consultez le guide pour choisir la bonne taille. Nos articles taillent petit.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto flex justify-center py-4">
            {product.size_guide_url ? (
              <img
                src={product.size_guide_url}
                alt="Guide des tailles"
                loading="lazy"
                className="max-w-full h-auto rounded-xl"
              />
            ) : (
              <p className="text-sm text-muted-foreground py-8">
                Guide indisponible pour ce produit.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Added to Cart Modal */}
      <Dialog open={openAdded} onOpenChange={setOpenAdded}>
        <DialogContent className="bg-background border-border sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <DialogTitle className="font-display text-xl text-center">
              Ajouté au panier
            </DialogTitle>
            <DialogDescription className="text-center font-sport">
              {quantity > 1 ? `${quantity}x ` : ""}<span className="font-medium text-foreground">{product.name}</span> a été ajouté à votre panier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <div className="flex items-center justify-between py-2 text-sm font-sport">
              <span className="text-muted-foreground">Taille</span>
              <span className="font-medium">{size}</span>
            </div>
            {number && (
              <div className="flex items-center justify-between py-2 text-sm font-sport">
                <span className="text-muted-foreground">Numéro</span>
                <span className="font-medium">{number}</span>
              </div>
            )}
            {product.type === "maillot" && flocage && (
              <div className="flex items-center justify-between py-2 text-sm font-sport">
                <span className="text-muted-foreground">Flocage</span>
                <span className="font-medium">{flocage}</span>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <Button 
              variant="magenta"
              className="w-full rounded-xl h-12"
              onClick={() => { setOpenAdded(false); navigate("/checkout"); }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Voir mon panier
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-xl h-12"
              onClick={() => { setOpenAdded(false); navigate("/shop"); }}
            >
              Continuer mes achats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
