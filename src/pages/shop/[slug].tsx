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

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [number, setNumber] = useState("");
  const [flocage, setFlocage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      const url = `${import.meta.env.VITE_SHEET_PRODUCTS_CSV_URL}?_ts=${Date.now()}`;
      const res = await fetch(url);
      const raw = await res.text();
      const lines = raw.replace(/\r/g, "").split("\n").filter(Boolean);
      const v = lines
        .slice(1)
        .map((line) => line.split(",").map((x) => x.trim()))
        .find((v) => v[0] === slug);
      if (!v) return setProduct(null);
      setProduct({
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
      });
    };
    fetchProduct();
  }, [slug]);

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

  if (!product) return <p className="text-center py-20">Produit introuvable.</p>;

  return (
    <div className="min-h-screen">
      <section className="py-12 px-4">
        <div className="container max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Galerie d’images */}
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
                {product.price_eur}€
              </p>

              {product.soldout && (
                <p className="text-red-500 font-semibold">
                  Produit actuellement en rupture
                </p>
              )}

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
};

export default ProductPage;
