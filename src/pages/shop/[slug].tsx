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

/** URL CSV propre (décode + ajoute _ts) */
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
  console.log("→ CSV URL utilisée ([slug]):", url);
  return url;
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

  useEffect(() => {
    async function fetchProduct() {
      setErrorMsg(null);
      setLoading(true);
      try {
        const res = await fetch(buildCsvUrl());
        const raw = await res.text();
        console.log("→ CSV reçu ([slug]):", raw.slice(0, 220));

        const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
        const list: Product[] = lines
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

        const found = list.find(
          (p) => (p.id || "").trim().toLowerCase() === safeSlug
        );
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

  const handleAddToCart = () => {
    if (!product) return;
    if (!size) return alert("Choisis ta taille !");
    if (product.type === "maillot" && (!number || !flocage))
      return alert("Ajoute ton numéro et ton nom pour le flocage !");
    if (product.type === "short" && !number)
      return alert("Ajoute ton numéro de short !");

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

    navigate("/checkout");
  };

  if (loading) return <p className="text-center py-20">Chargement...</p>;
  if (errorMsg) return <p className="text-center py-20 text-red-500">{errorMsg}</p>;
  if (!product) return <p className="text-center py-20">Produit introuvable.</p>;

  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {[product.image1, product.image2, product.image3, product.image4]
              .filter(Boolean)
              .map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={product.name}
                  className="w-full rounded-xl object-cover"
                />
              ))}
          </div>

          {/* Détails produit */}
          <Card className="shadow-lg border-border/10">
            <CardContent className="space-y-6 p-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-semibold text-primary">
                {product.price_eur.toFixed(2)}€
              </p>

              {product.soldout && (
                <p className="text-red-500 font-semibold">
                  Produit actuellement en rupture
                </p>
              )}

              {/* Taille */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  ⚠️ Taille petit —{" "}
                  <a
                    href={product.size_guide_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    consulter le guide des tailles
                  </a>
                </p>
                <Select onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "3XS",
                      "2XS",
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "2XL",
                      "3XL",
                      "4XL",
                      "5XL",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champs spécifiques */}
              {product.type === "maillot" && (
                <>
                  <Input
                    placeholder="Numéro de maillot"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                  <Input
                    placeholder="Nom flocage"
                    value={flocage}
                    onChange={(e) => setFlocage(e.target.value)}
                  />
                </>
              )}

              {product.type === "short" && (
                <Input
                  placeholder="Numéro short"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              )}

              {/* Infos livraison */}
              <p className="text-sm text-muted-foreground mt-4">
                Livraison sous 2 mois. <br />
                À récupérer en main propre auprès du club.
              </p>

              <Button
                onClick={handleAddToCart}
                disabled={product.soldout}
                className="w-full mt-4"
              >
                {product.soldout ? "Rupture de stock" : "Ajouter au panier"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
