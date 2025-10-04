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

/** Construit une URL CSV propre depuis la variable d'env */
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
  console.log("→ CSV URL utilisée (Shop):", url);
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
        console.log("→ CSV reçu (Shop):", raw.slice(0, 200));

        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
        if (lines.length < 2) {
          setProducts([]);
          return;
        }

        const items: Product[] = lines
          .slice(1)
          .map((line) => {
            const v = SPLIT(line);
            if (v.length < 11) return null;
            const price = parseFloat((v[3] || "0").replace("€", "").trim());
            return {
              id: (v[0] || "").trim(),
              name: v[1],
              type: (v[2] as ProductType) || "maillot",
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

        setProducts(items.filter((p) => p.active && p.id));
      } catch (err: any) {
        console.error("Erreur chargement produits:", err);
        setErrorMsg("Impossible de charger les produits (CSV).");
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
      <section className="py-12 px-4">
        <div className="container max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-background shadow-card border-border/10 hover:shadow-xl transition-all"
            >
              <CardContent className="p-4 space-y-4 flex flex-col justify-between">
                <img
                  src={product.image1}
                  alt={product.name}
                  className={`w-full aspect-square object-cover rounded-xl ${
                    product.soldout ? "opacity-50" : ""
                  }`}
                />

                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-muted-foreground font-sport text-sm">
                    {product.price_eur.toFixed(2)}€
                  </p>
                  {product.soldout && (
                    <p className="text-red-500 font-sport text-sm font-semibold">
                      En rupture de stock
                    </p>
                  )}
                </div>

                <Button
                  asChild
                  variant="cta"
                  disabled={product.soldout}
                  className="w-full"
                >
                  <Link
                    to={`/shop/${encodeURIComponent(
                      (product.id || "").trim().toLowerCase()
                    )}`}
                    aria-disabled={product.soldout ? "true" : "false"}
                    onClick={(e) => {
                      if (product.soldout) e.preventDefault();
                    }}
                  >
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
