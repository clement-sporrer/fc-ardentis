import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Check, Ruler, Package, AlertCircle } from "lucide-react";
import { toNumberSafe, stripBOM } from "@/lib/utils";

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
  size_guide_url: string;
  active: boolean;
  soldout: boolean;
}

function buildCsvUrl() {
  let base =
    (import.meta as any).env?.VITE_SHEET_PRODUCTS_CSV_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL ||
    "";
  try { base = decodeURIComponent(base); } catch {}
  base = base.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  return base + (base.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
}

const SPLIT = (s: string) => s.split(/\t|,/).map((x) => x.trim());
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

  const [openAdded, setOpenAdded] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

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
        
        if (res.redirected) {
          console.log('✅ Request redirected to:', res.url);
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const raw = stripBOM(await res.text());
        if (!raw || raw.trim().length === 0) {
          throw new Error("Réponse vide du serveur");
        }
        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);

        const list: Product[] = lines.slice(1).map((line) => {
          const v = SPLIT(line);
          if (v.length < 11) return null;

          return {
            id: (v[0] || "").trim().toLowerCase(),
            name: (v[1] || "").trim(),
            type: ((v[2] || "").trim().toLowerCase() as ProductType) || "maillot",
            price_eur: toNumberSafe((v[3] || "0"), 0),
            image1: v[4] || "",
            image2: v[5] || "",
            image3: v[6] || "",
            image4: v[7] || "",
            size_guide_url: v[8] || "",
            active: (v[9] || "").toLowerCase() === "true",
            soldout: (v[10] || "").toLowerCase() === "true",
          } as Product;
        }).filter(Boolean) as Product[];

        const found = list.find((p) => (p.id || "").toLowerCase() === safeSlug);
        setProduct(found || null);
      } catch (e: any) {
        console.error("Erreur chargement produit:", e);
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

    setOpenAdded(true);
  };

  const images = product
    ? [product.image1, product.image2, product.image3, product.image4].filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen">
        <section data-hero="true" className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden bg-gradient-hero">
          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <Skeleton className="h-8 w-48 mx-auto bg-white/10" />
          </div>
        </section>
        <section className="py-12 px-4 sm:px-6 bg-gradient-section">
          <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen">
        <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
          <div className="container max-w-2xl mx-auto px-4 text-center relative z-10 pt-16">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display font-bold text-2xl text-white mb-4">{errorMsg}</h1>
            <Button asChild variant="magenta" className="rounded-full">
              <Link to="/shop">Retour à la boutique</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
          <div className="container max-w-2xl mx-auto px-4 text-center relative z-10 pt-16">
            <Package className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h1 className="font-display font-bold text-2xl text-white mb-4">Produit introuvable</h1>
            <Button asChild variant="magenta" className="rounded-full">
              <Link to="/shop">Retour à la boutique</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section data-hero="true" className="relative pt-24 sm:pt-28 pb-8 sm:pb-12 overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white font-sport text-sm transition-colors mb-4"
          >
            Retour à la boutique
          </Link>
          <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white">
            {product.name}
          </h1>
        </div>
      </section>

      {/* Product Content */}
      <section className="py-12 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted/30">
              <img 
                src={images[selectedImage] || images[0]} 
                alt={product.name} 
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i 
                        ? "border-primary shadow-lg scale-105" 
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <Card className="premium-card">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-3xl text-primary">
                    {Number(toNumberSafe(product.price_eur, 0)).toFixed(2)}€
                  </p>
                  {product.soldout && (
                    <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-bold">
                      Rupture
                    </span>
                  )}
                </div>

                {/* Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-sport text-sm text-muted-foreground">Taille *</label>
                    <button
                      type="button"
                      onClick={() => setOpenGuide(true)}
                      className="text-primary text-sm font-sport hover:underline flex items-center gap-1"
                    >
                      <Ruler className="h-4 w-4" />
                      Guide des tailles
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">⚠️ Ça taille petit</p>
                  <Select onValueChange={setSize}>
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue placeholder="Choisir une taille" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Fields */}
                {product.type === "maillot" && (
                  <>
                    <div>
                      <label className="font-sport text-sm text-muted-foreground mb-2 block">
                        Numéro de maillot (optionnel)
                      </label>
                      <Input
                        placeholder="Ex: 10"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-sport text-sm text-muted-foreground mb-2 block">
                        Nom flocage (optionnel)
                      </label>
                      <Input
                        placeholder="Ex: MBAPPÉ"
                        value={flocage}
                        onChange={(e) => setFlocage(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </>
                )}

                {product.type === "short" && (
                  <div>
                    <label className="font-sport text-sm text-muted-foreground mb-2 block">
                      Numéro (optionnel)
                    </label>
                    <Input
                      placeholder="Ex: 7"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                )}

                {/* Delivery Info */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-sm font-sport text-muted-foreground">
                    <Package className="h-4 w-4 inline mr-2" />
                    Livraison sous 2 mois • Retrait en main propre
                  </p>
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  disabled={product.soldout || !size}
                  variant="magenta"
                  size="xl"
                  className="w-full rounded-xl font-display"
                >
                  {product.soldout ? "Rupture de stock" : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Ajouter au panier
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      <Dialog open={openGuide} onOpenChange={setOpenGuide}>
        <DialogContent className="max-w-3xl bg-card">
          <DialogHeader>
            <DialogTitle className="font-display">Guide des tailles</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto flex justify-center">
            {product.size_guide_url ? (
              <img
                src={product.size_guide_url}
                alt="Guide des tailles"
                loading="lazy"
                className="max-w-full h-auto rounded-lg"
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
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Ajouté au panier
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="font-sport">
              <b>{product.name}</b> a été ajouté à votre panier.
            </p>
            <p className="text-sm text-muted-foreground font-sport mt-2">
              Taille: {size}
              {number && <> • N°{number}</>}
              {product.type === "maillot" && flocage && <> • {flocage}</>}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={() => { setOpenAdded(false); navigate("/shop"); }}
            >
              Continuer mes achats
            </Button>
            <Button 
              variant="magenta"
              className="rounded-full"
              onClick={() => { setOpenAdded(false); navigate("/checkout"); }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Voir mon panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
