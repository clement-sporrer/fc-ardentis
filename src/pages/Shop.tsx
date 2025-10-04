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

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(buildCsvUrl());
        if (!res.ok) throw new Error("Erreur CSV");
        const csvText = await res.text();

        // Nettoyage et parsing
        const rows = csvText.trim().split("\n").filter(Boolean);
        const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());
        const products = rows.slice(1).map((line) => {
          const cols = line.split(",").map((c) => c.trim());
          const get = (key: string) =>
            cols[headers.indexOf(key)]?.trim() || "";

          // ✅ Supporte prix "55,99"
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

        const actives = products.filter((p) => p.active && p.id);
        setProducts(actives);
      } catch (err) {
        console.error("Erreur parsing CSV:", err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (error)
    return <p className="text-center py-20 text-red-500">{error}</p>;

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 grid md:grid-cols-3 gap-8">
      {products.map((p) => (
        <Card
          key={p.id}
          className="bg-background shadow-card border-border/10 hover:shadow-lg transition"
        >
          <CardContent className="p-4 flex flex-col space-y-4 justify-between">
            <img
              src={p.image1}
              alt={p.name}
              className={`w-full aspect-square object-cover rounded-xl ${
                p.soldout ? "opacity-50" : ""
              }`}
            />
            <div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-muted-foreground text-sm">
                {p.price_eur.toFixed(2)} €
              </p>
              {p.soldout && (
                <p className="text-red-500 text-sm font-semibold">
                  En rupture de stock
                </p>
              )}
            </div>
            <Button
              asChild
              variant="cta"
              disabled={p.soldout}
              className="w-full"
            >
              <Link
                to={`/shop/${encodeURIComponent(p.id)}`}
                onClick={(e) => p.soldout && e.preventDefault()}
              >
                {p.soldout ? "Rupture" : "Voir le produit"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
