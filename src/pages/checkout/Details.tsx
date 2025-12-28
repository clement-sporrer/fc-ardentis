import { useState, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneField, isValidIntlPhone } from "@/components/PhoneField";
import { CreditCard, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { toNumberSafe } from "@/lib/utils";

function formatEUR(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " €";
}

export default function CheckoutDetails() {
  const { state } = useCart();
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const items = Array.isArray(state.items) ? state.items : [];

  const total = useMemo(() => {
    return items.reduce((sum, it: any) => {
      const p = toNumberSafe(it?.price_eur, 0);
      const q = Math.max(1, toNumberSafe(it?.quantity, 1));
      return sum + p * q;
    }, 0);
  }, [items]);

  // Validation
  const isNonEmpty = (s: string) => s.trim().length > 0;
  const isValidEmail = (s: string) => /^(?!.{255})([\w.!#$%&'*+\-/=?^`{|}~]+)@([\w-]+\.)+[A-Za-z]{2,}$/.test(s.trim());
  const firstNameValid = isNonEmpty(firstName);
  const lastNameValid = isNonEmpty(lastName);
  const emailValid = isValidEmail(email);
  const phoneValid = isValidIntlPhone(phone);

  const canSubmit = firstNameValid && lastNameValid && emailValid && phoneValid && items.length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload = {
        customer: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          note: note.trim(),
        },
        items: items.map((it: any) => ({
          id: String(it.id),
          name: String(it.name),
          quantity: Math.max(1, toNumberSafe(it.quantity, 1)),
          price_eur: toNumberSafe(it.price_eur, 0),
          size: String(it.size || ""),
          number: String(it.number || ""),
          flocage: String(it.flocage || ""),
          image_url: String(it.image_url || ""),
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.url) {
        window.location.href = json.url;
        return;
      }

      const errMsg = json?.error || "Impossible de créer la session de paiement.";
      alert(errMsg);
    } catch (err) {
      console.error(err);
      alert("Erreur inattendue lors de la création du paiement.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <div className="min-h-screen">
        <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
          <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 pt-24 sm:pt-28 pb-16">
            <h1 className="font-display font-bold text-3xl text-white mb-4">Aucun article</h1>
            <p className="text-white/70 font-sport mb-6">Ajoutez d'abord des produits à votre panier.</p>
            <Button asChild variant="magenta" size="xl" className="rounded-full">
              <Link to="/shop">Retour à la boutique</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 font-sport outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section data-hero="true" className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="flex items-center justify-center gap-4 mb-4 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <CreditCard className="h-6 w-6 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-2 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="text-gradient-magenta">Finaliser</span> la commande
          </h1>
          
          <p className="text-white/70 font-sport animate-rise-up" style={{ animationDelay: "200ms" }}>
            Livraison sous 2 mois • Retrait en main propre
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 bg-gradient-section">
        <div className="container max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <Card className="premium-card">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
                    Vos informations
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Prénom *</label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Ex. Kylian"
                        className={inputClass}
                      />
                      {submitted && !firstNameValid && (
                        <p className="mt-1 text-xs text-destructive font-sport">Le prénom est requis.</p>
                      )}
                    </div>
                    <div>
                      <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Nom *</label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Ex. Mbappé"
                        className={inputClass}
                      />
                      {submitted && !lastNameValid && (
                        <p className="mt-1 text-xs text-destructive font-sport">Le nom est requis.</p>
                      )}
                    </div>
                    <div>
                      <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Email *</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="exemple@domaine.com"
                        className={inputClass}
                      />
                      {submitted && !emailValid && (
                        <p className="mt-1 text-xs text-destructive font-sport">Adresse email invalide.</p>
                      )}
                    </div>
                    <div>
                      <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Téléphone *</label>
                      <PhoneField value={phone} onChange={setPhone} required />
                      {submitted && !phoneValid && (
                        <p className="mt-1 text-xs text-destructive font-sport">Numéro invalide.</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Commentaire (optionnel)</label>
                      <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Infos utiles (disponibilités, etc.)"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap gap-3">
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      variant="magenta"
                      size="xl"
                      className="rounded-full font-display"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Redirection…
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-5 w-5 mr-2" />
                          Payer maintenant
                        </>
                      )}
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/checkout">
                        <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
                        Retour au panier
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <Card className="premium-card sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-display font-bold text-xl mb-4">Récapitulatif</h2>

                  <div className="space-y-3 mb-6">
                    {items.map((it: any) => {
                      const price = toNumberSafe(it?.price_eur, 0);
                      const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
                      return (
                        <div key={it.lineItemId} className="flex items-center gap-3">
                          {it.image_url ? (
                            <img
                              src={it.image_url}
                              alt={it.name}
                              loading="lazy"
                              className="w-14 h-14 rounded-lg object-cover border border-border/20"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-muted" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-sport font-medium truncate">{it.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {it.size && `Taille ${it.size}`}
                              {it.number && ` • N° ${it.number}`}
                              {qty > 1 && ` • Qté ${qty}`}
                            </div>
                          </div>
                          <div className="text-sm font-display font-bold text-primary whitespace-nowrap">
                            {formatEUR(price * qty)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border/20 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-lg">Total</span>
                      <span className="font-display font-bold text-2xl text-primary">
                        {formatEUR(total)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-sport">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Paiement sécurisé via Stripe
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
