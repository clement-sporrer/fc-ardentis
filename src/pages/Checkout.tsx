import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { PhoneField } from '@/components/PhoneField';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { state } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    size: '',
    jerseyNumber: '',
    flockingName: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (state.items.length === 0 && !submitted) {
    return (
      <div className="min-h-screen">
        <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
          <div className="container max-w-5xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6">
              Votre <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">commande</span>
            </h1>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="bg-gradient-card p-12 rounded-3xl shadow-card border border-border/10">
              <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl md:text-2xl font-sport-condensed font-bold text-foreground mb-4">
                Votre panier est vide
              </h3>
              <p className="text-muted-foreground font-sport text-lg mb-6">
                Ajoutez des articles à votre panier pour continuer vos achats
              </p>
              <Button asChild variant="default" size="lg">
                <Link to="/shop">Voir la boutique</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <section className="py-20 px-4">
          <div className="container max-w-2xl mx-auto text-center">
            <div className="bg-gradient-card p-12 rounded-3xl shadow-card border border-border/10">
              <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-sport-condensed font-bold text-foreground mb-4">
                Commande enregistrée !
              </h1>
              <p className="text-muted-foreground font-sport text-lg mb-8">
                Votre commande a été enregistrée. Nous vous recontacterons prochainement pour finaliser le paiement et la livraison.
              </p>
              <div className="space-y-4">
                <Button asChild variant="default" size="lg">
                  <Link to="/shop">Continuer mes achats</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">Retour à l'accueil</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="container max-w-5xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-sport-condensed font-bold text-white mb-6">
            Finaliser ma <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">commande</span>
          </h1>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire */}
            <Card className="bg-gradient-card shadow-card border-border/10">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-sport-condensed font-bold text-foreground">
                  Informations de commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="font-sport font-medium">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-sport font-medium">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="font-sport font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label className="font-sport font-medium">Téléphone</Label>
                    <PhoneField
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value || '')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="font-sport font-medium">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="font-sport font-medium">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="font-sport font-medium">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-sport font-medium">Taille</Label>
                      <Select onValueChange={(value) => handleInputChange('size', value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir taille" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="jerseyNumber" className="font-sport font-medium">Numéro maillot</Label>
                      <Input
                        id="jerseyNumber"
                        value={formData.jerseyNumber}
                        onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                        placeholder="Ex: 10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="flockingName" className="font-sport font-medium">Nom flocage</Label>
                    <Input
                      id="flockingName"
                      value={formData.flockingName}
                      onChange={(e) => handleInputChange('flockingName', e.target.value)}
                      placeholder="Ex: MARTIN"
                    />
                  </div>

                  <Button type="submit" variant="default" size="lg" className="w-full">
                    Payer plus tard
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Récapitulatif commande */}
            <Card className="bg-gradient-card shadow-card border-border/10 h-fit">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-sport-condensed font-bold text-foreground">
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.sku} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="h-16 w-16 object-contain rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-sport-condensed font-bold text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground font-sport">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-sport-condensed font-bold text-primary">
                      {(item.price_eur * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-sport-condensed font-bold text-foreground">Total</span>
                    <span className="text-2xl font-sport-condensed font-bold text-primary">
                      {state.total.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;