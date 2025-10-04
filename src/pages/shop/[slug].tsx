import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

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

/** Génère une URL CSV propre à partir de la variable d'environnement */
function buildCsvUrl() {
  let base =
    (import.meta as any).env?.VITE_SHEET_PRODUCTS_CSV_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL ||
    "";
  try { base = decodeURIComponent(base); } catch {}
  base = base.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  const url = base + (base.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
  console.log("→ CSV URL utilisée ([slug]):", url);
  return url;
}

/** Split simple CSV */
const SPLIT = (s: string) => s.split(/\t|,/).map((x) => x.trim());

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

  // Chargement du produit
  useEffect(() => {
    async function fetchProduct() {
      setErrorMsg(null);
      setLoading(true);
      try {
        const res = await fetch(buildCsvUrl());
        const raw = await res.text();
        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
        const list: Product[] = lines
          .slice(1)
          .map((line) => {
            const v = SPLIT(line);
            if (v.length < 11) return null;
            const price = parseFloat((v[3] || "0").replace("€", "").trim());
            return {
              id: (v[0] || "").trim().toLowerCase(),
              name: (v[1] || "").trim(),
              type: ((v[2] || "").trim().toLowerCase() as ProductType) || "maillot",
              price_eur: isNaN(price) ? 0 : price,
              image1: v[4] || "",
              image2: v[5] || "",
              image3: v[6] || "",
              image4: v[7] || "",
              size_guide_url: v[8] || "",
              active: (v[9] || "").toLowerCase() === "true",
              soldout: (v[10] || "").toLowerCase() === "true",
            } as Product;
          })
          .filter(Boolean) as Product[];

        const found = list.find((p) => (p.id || "").toLowerCase() === safeSlug);
        setProduct(found || null);
      } catch (e: any) {
        console.error("Erreur chargement produit:", e);
        setErrorMsg("Impossible de charger ce produit.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [safeSlug]);

  /** Ajout au panier (robuste) */
  const handleAddToCart = () => {
    if (!product) return;
    if (!size) {
      alert("Choisis ta taille !");
      return;
    }

    try {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: product.id || "",
          name: product.name || "",
          price_eur: Number.isFinite(product.price_eur) ? product.price_eur : 0,
          quantity: 1,
          image_url: product.image1 || "",
          size,
          number,
          flocage,
        },
      });
      setOpenAdded(true);
    } catch (e) {
      console.error("ADD_ITEM failed", e);
      alert("Erreur lors de l’ajout au panier.");
    }
  };

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (errorMsg) return <p className="text-center py-20 text-red-500">{errorMsg}</p>;
  if (!product) return <p className="text-center py-20">Produit introuvable.</p>;

  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Galerie */}
          <div className="space-y-4">
            {[product.image1, product.image2, product.image3, product.image4]
              .filter(Boolean)
              .map((img, i) => (
                <img key={i} src={img} alt={product.name} className="w-full rounded-xl" />
              ))}
          </div>

          {/* Détails */}
          <Card className="shadow-lg border-border/10">
            <CardContent className="space-y-6 p-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-semibold text-primary">
                {product.price_eur.toFixed(2)}€
              </p>

              {product.soldout && (
                <p className="text-red-500 font-semibold">Produit en rupture de stock</p>
              )}

              {/* Taille */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  ⚠️ Taille petit —{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenGuide(true);
                    }}
                    className="text-primary underline underline-offset-4"
                  >
                    consulter le guide des tailles
                  </button>
                </p>
                <Select onValueChange={setSize}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border">
                    {["3XS","2XS","XS","S","M","L","XL","2XL","3XL","4XL","5XL"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champs personnalisés */}
              {product.type === "maillot" && (
                <>
                  <Input placeholder="Numéro de maillot (optionnel)" value={number} onChange={(e) => setNumber(e.target.value)} />
                  <Input placeholder="Nom flocage (optionnel)" value={flocage} onChange={(e) => setFlocage(e.target.value)} />
                </>
              )}
              {product.type === "short" && (
                <Input placeholder="Numéro short (optionnel)" value={number} onChange={(e) => setNumber(e.target.value)} />
              )}

              <p className="text-sm text-muted-foreground mt-4">
                Livraison sous 2 mois. <br /> À récupérer en main propre auprès du club.
              </p>

              <Button onClick={handleAddToCart} disabled={product.soldout} className="w-full mt-4">
                {product.soldout ? "Rupture de stock" : "Ajouter au panier"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modale guide tailles */}
      <Dialog open={openGuide} onOpenChange={setOpenGuide}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Guide des tailles</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto flex justify-center">
            {product.size_guide_url ? (
              <img
                src={product.size_guide_url}
                alt="Guide des tailles"
                className="max-w-full h-auto rounded-lg"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun guide des tailles disponible pour ce produit.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale ajout panier */}
      <Dialog open={openAdded} onOpenChange={setOpenAdded}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouté au panier</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm">
              <b>{product.name}</b> a été ajouté à votre panier.
            </p>
            <p className="text-sm text-muted-foreground">
              Taille : {size}{" "}
              {number ? <>• Numéro : {number} </> : null}
              {flocage ? <>• Flocage : {flocage}</> : null}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setOpenAdded(false); navigate("/shop"); }}>
              Continuer mes achats
            </Button>
            <Button onClick={() => { setOpenAdded(false); navigate("/checkout"); }}>
              Voir mon panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
