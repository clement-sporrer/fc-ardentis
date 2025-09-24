import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Shirt } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const GOOGLE_SHEET_PRODUCTS_CSV_URL = import.meta.env.VITE_SHEET_PRODUCTS_CSV_URL || "";

interface Product {
  sku: string;
  name: string;
  variant: 'home' | 'exclusive' | 'keeper';
  price_eur: number;
  image_url: string;
  active: boolean;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useCart();

  // Produits par défaut si pas de CSV
  const defaultProducts: Product[] = [
    {
      sku: 'FC-HOME-001',
      name: 'Maillot Domicile',
      variant: 'home',
      price_eur: 45,
      image_url: '/assets/logo.png',
      active: true
    },
    {
      sku: 'FC-EXC-001',
      name: 'Maillot Exclusif',
      variant: 'exclusive',
      price_eur: 55,
      image_url: '/assets/logo.png',
      active: true
    },
    {
      sku: 'FC-KEEP-001',
      name: 'Maillot Gardien',
      variant: 'keeper',
      price_eur: 50,
      image_url: '/assets/logo.png',
      active: true
    }
  ];

  const variantLabels = {
    home: 'Domicile',
    exclusive: 'Exclusif',
    keeper: 'Gardien'
  };

  const variantColors = {
    home: 'bg-primary text-primary-foreground',
    exclusive: 'bg-accent text-accent-foreground',
    keeper: 'bg-secondary text-secondary-foreground'
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!GOOGLE_SHEET_PRODUCTS_CSV_URL) {
        setProducts(defaultProducts);
        setLoading(false);
        return;
      }

      try {
        const url = `${GOOGLE_SHEET_PRODUCTS_CSV_URL}${GOOGLE_SHEET_PRODUCTS_CSV_URL.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
        const response = await fetch(url, { cache: 'no-store' });
        const raw = await response.text();
        
        const lines = raw.replace(/\r/g, '').split('\n').filter(Boolean);
        const productData: Product[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 6 && values[0]) {
            const product: Product = {
              sku: values[0] || '',
              name: values[1] || '',
              variant: (values[2] as 'home' | 'exclusive' | 'keeper') || 'home',
              price_eur: parseFloat(values[3]) || 0,
              image_url: values[4] || '/assets/logo.png',
              active: values[5]?.toLowerCase() === 'true'
            };
            if (product.active) {
              productData.push(product);
            }
          }
        }

        setProducts(productData.length > 0 ? productData : defaultProducts);
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des produits");
        setProducts(defaultProducts);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        sku: product.sku,
        name: product.name,
        variant: product.variant,
        price_eur: product.price_eur,
        image_url: product.image_url
      }
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6 text-center">
            Boutique <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">officielle</span>
          </h1>
          <p className="text-lg text-white/90 font-sport max-w-3xl mx-auto text-center">
            Soutenez le FC Ardentis avec nos maillots officiels
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4 bg-gradient-section">
        <div className="container max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-4 text-muted-foreground font-sport text-lg bg-gradient-card p-6 rounded-2xl shadow-card">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                Chargement de la boutique...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-gradient-card p-12 rounded-3xl shadow-card border border-border/10 max-w-2xl mx-auto">
                <ShoppingBag className="h-20 w-20 text-primary mx-auto mb-6" />
                <h3 className="text-xl md:text-2xl font-sport-condensed font-bold text-foreground mb-4">
                  Boutique temporairement indisponible
                </h3>
                <p className="text-muted-foreground font-sport text-lg mb-6">
                  Produits par défaut affichés. La boutique sera bientôt disponible avec tous nos maillots officiels !
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.sku} className="bg-gradient-card shadow-card border-border/10 hover-lift overflow-hidden">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/70 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
                      {product.image_url && product.image_url !== '/assets/logo.png' ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-sport"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent">
                          <img 
                            src="/assets/logo.png"
                            alt="FC Ardentis Logo"
                            className="h-16 w-auto object-contain mb-4"
                          />
                          <Shirt className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Badge className={variantColors[product.variant]}>
                          {variantLabels[product.variant]}
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-sport-condensed font-bold text-foreground">
                        {product.name}
                      </h3>
                      
                      <p className="text-2xl font-sport-condensed font-bold text-primary">
                        {product.price_eur}€
                      </p>
                      
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        variant="cta" 
                        size="lg"
                        className="w-full"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Ajouter au panier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;