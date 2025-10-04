import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  type: "maillot" | "short";
  price_eur: number;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  size_guide_url: string;
  active: boolean;
  soldout: boolean;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = `${import.meta.env.VITE_SHEET_PRODUCTS_CSV_URL}?_ts=${Date.now()}`;
        const response = await fetch(url);
        const raw = await response.text();

        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
        const headers = lines[0].split(",").map((h) => h.trim());
        const items = lines.slice(1).map((line) => {
          const v = line.split(",").map((x) => x.trim());
          return {
            id: v[0],
            name: v[1],
            type: v[2] as "maillot" | "short",
            price_eur: parseFloat(v[3]),
            image1: v[4],
            image2: v[5],
            image3: v[6],
            image4: v[7],
            size_guide_url: v[8],
            active: v[9].toLowerCase() === "true",
            soldout: v[10].toLowerCase() === "true",
          };
        });

        setProducts(items.filter((p) => p.active));
      } catch (err) {
        console.error("Erreur chargement produits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center py-20">Chargement...</p>;

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
                    {product.price_eur}€
                  </p>
                  {product.soldout && (
                    <p className="text-red-500 font-sport text-sm font-semibold">
                      En rupture de stock
                    </p>
                  )}
                </div>

                <Button
                  variant="cta"
                  disabled={product.soldout}
                  onClick={() => navigate(`/shop/${product.id}`)}
                  className="w-full"
                >
                  {product.soldout ? "Rupture" : "Voir le produit"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Shop;
