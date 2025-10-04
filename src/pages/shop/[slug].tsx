import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  let base = (import.meta as any).env?.VITE_SHEET_PRODUCTS_CSV_URL || (import.meta as any).env?.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL || "";
  try { base = decodeURIComponent(base); } catch {}
  base = base.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  return base + (base.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
}

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

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(buildCsvUrl());
        const raw = await res.text();
        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);

        const list: Product[] = lines.slice(1).map((line) => {
          const v = SPLIT(line);
          if (v.length < 11) return null;

          let priceStr = (v[3] || "0").replace(/[^\d,.-]/g, "").trim();
          priceStr = priceStr.replace(",", ".");
          let price = parseFloat(priceStr);
          if (isNaN(price) || !isFinite(price)) price = 0;

          return {
            id: (v[0] || "").trim().toLowerCase(),
            name: (v[1] || "").trim(),
            type: ((v[2] || "").trim().toLowerCase() as ProductType) || "maillot",
            price_eur: price,
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
        console.log("🧩 Produit trouvé ([slug]):", found);
        setProduct(found || null);
      } catch (e: any) {
        console.error(e);
        setErrorMsg("Impossible de charger ce produit.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [safeSlug]);

  const handleAddToCart = () => {
    console.log("🧩 AJOUT AU PANIER : produit brut =", product);
    if (!product) return;
    if (!size) return alert("Choisis ta taille !");
    const safePrice = Number.isFinite(product.price_eur)
      ? product.price_eur
      : parseFloat(String(product.price_eur).replace(",", "."));
    console.log("🧩 Produit envoyé au panier =", {
      id: product.id,
      name: product.name,
      price_eur: safePrice,
      type: typeof safePrice,
    });
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price_eur: safePrice,
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
  if (errorMsg) return <p className="text-center py-20 text-red-500">{errorMsg}</p>;
  if (!product) return <p className="text-center py-20">Produit introuvable.</p>;

  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
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
                {Number(product.price_eur || 0).toFixed(2)}€
              </p>
              <Button onClick={handleAddToCart} disabled={product.soldout} className="w-full mt-4">
                Ajouter au panier
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
