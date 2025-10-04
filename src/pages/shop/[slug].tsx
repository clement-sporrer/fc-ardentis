import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

function buildCsvUrl() {
  let base =
    (import.meta as any).env?.VITE_SHEET_PRODUCTS_CSV_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL ||
    "";
  try {
    base = decodeURIComponent(base);
  } catch {}
  base = base.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  return base + (base.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = decodeURIComponent((slug || "").trim().toLowerCase());
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState("");
  const [number, setNumber] = useState("");
  const [flocage, setFlocage] = useState("");
  const [openAdded, setOpenAdded] = useState(false);
  const [openGuide, setOpenGuide] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(buildCsvUrl());
        if (!res.ok) throw new Error("Erreur CSV");
        const text = await res.text();

        const lines = text.trim().split("\n").filter(Boolean);
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const products = lines.slice(1).map((line) => {
          const cols = line.split(",").map((v) => v.trim());
          const get = (key: string) => cols[headers.indexOf(key)] || "";

          // ✅ Support prix avec virgule
          let priceStr = get("price_eur")
            .replace(/[^\d,.-]/g, "")
            .replace(",", ".");
          const parsedPrice = parseFloat(priceStr);
          const price = isNaN(parsedPrice) ? 0 : parsedPrice;

          return {
            id: get("id").toLowerCase(),
            name: get("name"),
            type: (get("type") as ProductType) || "maillot",
            price_eur: price,
            image1: get("image1"),
            image2: get("image2"),
            image3: get("image3"),
            image4: get("image4"),
            size_guide_url: get("size_guide_url"),
            active: get("active").toLowerCase() === "true",
            soldout: get("soldout").toLowerCase() === "true",
          } as Product;
        });

        const found = products.find((p) => p.id === safeSlug);
        setProduct(found || null);
      } catch (err) {
        console.error("Erreur CSV produit:", err);
        setError("Impossible de charger ce produit.");
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
        price_eur: product.price_eur,
        quantity: 1,
        image_url: product.image1,
        size,
        number,
        flocage,
      },
    });
    setOpenAdded(true);
  };

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (error)
    return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!product) return <p className="text-center py-20">Produit introuvable.</p>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          {[product.image1, product.image2, product.image3, product.image4]
            .filter(Boolean)
            .map((img, i) => (
              <img key={i} src={img} alt={product.name} className="w-full rounded-xl" />
            ))}
        </div>

        <Card className="shadow-lg border-border/10">
          <CardContent className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary">
              {product.price_eur.toFixed(2)} €
            </p>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                ⚠️ Taille petit —{" "}
                <button
                  type="button"
                  onClick={() => setOpenGuide(true)}
                  className="text-primary underline"
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
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {product.type === "maillot" && (
              <>
                <Input
                  placeholder="Numéro de maillot (optionnel)"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
                <Input
                  placeholder="Nom flocage (optionnel)"
                  value={flocage}
                  onChange={(e) => setFlocage(e.target.value)}
                />
              </>
            )}

            {product.type === "short" && (
              <Input
                placeholder="Numéro short (optionnel)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            )}

            <p className="text-sm text-muted-foreground">
              Livraison sous 2 mois. <br />
              À récupérer en main propre auprès du club.
            </p>

            <Button onClick={handleAddToCart} className="w-full mt-4">
              Ajouter au panier
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
