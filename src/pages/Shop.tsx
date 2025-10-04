import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

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

/** URL propre du CSV depuis variable d'environnement */
function buildCsvUrl() {
  let base =
    (import.meta as any).env?.VITE_SHEET_PRODUCTS_CSV_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_SHEET_PRODUCTS_CSV_URL ||
    "";
  try {
    base = decodeURIComponent(base);
  } catch {}
  base = base.replace(/([?&])_ts=[^&]*/g, "").replace(/[?&]$/, "");
  const url = base + (base.includes("?") ? "&" : "?") + `_ts=${Date.now()}`;
  return url;
}

const SPLIT = (s: string) => s.split(/\t|,/).map((x) => x.trim());

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setErrorMsg(null);
      try {
        const res = await fetch(buildCsvUrl());
        const raw = await res.text();
        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
        if (lines.length < 2) return;

        const items: Product[] = lines
          .slice(1)
          .map((line) => {
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
          })
          .filter(Boolean) as Product[];

        console.log("🧩 Produits chargés (Shop):", items);
        setProducts(items.filter((p) => p.active && p.id));
      } catch (err: any) {
        console.error("Erreur chargement produits:", err);
        setErrorMsg("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (errorMsg) return <p className="text-center py-20 text-red-500">{errorMsg}</p>;

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-r from-[#0A0A0A] to-[#151515] py-20 text-center text-white">
        <div className="container mx-auto">
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-white">Notre</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2b7fff] to-[#55bfff]">
              Boutique
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez les maillots et shorts officiels du FC Ardentis.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="bg-background shadow-card border-border/10 hover:shadow-xl transition-all">
              <CardContent className="p-4 space-y-4 flex flex-col justify-between">
                <img
                  src={product.image1}
                  alt={product.name}
                  className={`w-full aspect-square object-cover rounded-xl ${product.soldout ? "opacity-50" : ""}`}
                />
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-muted-foreground font-sport text-sm">
                    {Number(product.price_eur || 0).toFixed(2)}€
                  </p>
                  {product.soldout && (
                    <p className="text-red-500 font-sport text-sm font-semibold">En rupture de stock</p>
                  )}
                </div>
                <Button asChild variant="cta" disabled={product.soldout} className="w-full">
                  <Link to={`/shop/${encodeURIComponent(product.id)}`} onClick={(e) => { if (product.soldout) e.preventDefault(); }}>
                    {product.soldout ? "Rupture" : "Voir le produit"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
