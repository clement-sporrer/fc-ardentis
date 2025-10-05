// src/pages/checkout/Details.tsx
import { useState, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneField, isValidIntlPhone } from "@/components/PhoneField";

/** Convertit en nombre sûr (accepte 55,99 ou 55.99) */
function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/** Format EUR avec virgule (ex: 55,99 €) */
function formatEUR(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " €";
}

export default function CheckoutDetails() {
  const { state } = useCart();
  const navigate = useNavigate();

  // Form client
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState(""); // <— même API que Rejoindre
  const [note,      setNote]      = useState("");

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

  // Validations plus strictes
  const isNonEmpty = (s: string) => s.trim().length > 0;
  const isValidEmail = (s: string) => /^(?!.{255})([\w.!#$%&'*+\-/=?^`{|}~]+)@([\w-]+\.)+[A-Za-z]{2,}$/.test(s.trim());
  const firstNameValid = isNonEmpty(firstName);
  const lastNameValid = isNonEmpty(lastName);
  const emailValid = isValidEmail(email);
  const phoneValid = isValidIntlPhone(phone);

  const canSubmit =
    firstNameValid &&
    lastNameValid &&
    emailValid &&
    phoneValid &&
    items.length > 0 &&
    !submitting;

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
          phone: phone.trim(), // comme Rejoindre : string en format international
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
        window.location.href = json.url; // redirection Stripe
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
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Aucun article</h1>
        <p className="text-muted-foreground mb-6">Ajoute d’abord des produits à ton panier.</p>
        <Button asChild>
          <Link to="/shop">Retour à la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      {/* Bandeau titre avec dégradé violet */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
            Informations & récapitulatif
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Livraison sous 2 mois • Retrait en main propre auprès du club
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        {/* Colonne gauche : Formulaire client */}
        <div className="md:col-span-2">
          <Card className="border-border/20 shadow">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Ex. Kylian"
                  />
                  {submitted && !firstNameValid && (
                    <p className="mt-1 text-xs text-destructive font-sport">Le prénom est requis.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Ex. Mbappé"
                  />
                  {submitted && !lastNameValid && (
                    <p className="mt-1 text-xs text-destructive font-sport">Le nom est requis.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="exemple@domaine.com"
                  />
                  {submitted && !emailValid && (
                    <p className="mt-1 text-xs text-destructive font-sport">Adresse email invalide.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  {/* ✅ On réutilise le même composant que Rejoindre */}
                  <PhoneField value={phone} onChange={setPhone} required />
                  {submitted && !phoneValid && (
                    <p className="mt-1 text-xs text-destructive font-sport">Numéro de téléphone invalide.</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Commentaire (optionnel)</label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Infos utiles (disponibilités, remise, etc.)"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-6 py-5 font-semibold shadow-md bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa] text-white hover:brightness-110"
                >
                  {submitting ? "Redirection…" : "Payer maintenant"}
                </Button>
                <Button asChild variant="outline">
                  <Link to="/checkout">Retour au panier</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/shop">Continuer mes achats</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : Récap panier */}
        <div className="md:col-span-1">
          <Card className="border-border/20 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold mb-2">Récapitulatif</h2>

              <div className="space-y-3">
                {items.map((it: any) => {
                  const price = toNumberSafe(it?.price_eur, 0);
                  const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
                  const line = price * qty;
                  return (
                    <div key={it.lineItemId} className="flex items-center gap-3">
                      {it.image_url ? (
                        <img
                          src={it.image_url}
                          alt={it.name}
                          className="w-14 h-14 rounded-lg object-cover border border-border/20"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{it.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {it.size ? `Taille ${it.size}` : ""}
                          {it.number ? ` • N° ${it.number}` : ""}
                          {it.flocage ? ` • ${it.flocage}` : ""}
                          {qty ? ` • Qté ${qty}` : ""}
                        </div>
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap">
                        {formatEUR(line)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border/20 pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{formatEUR(total)}</span>
                </div>
                <div className="flex items-center justify-between text-base mt-1">
                  <span className="font-semibold">Total</span>
                  <span className="font-extrabold bg-gradient-to-r from-[#7c3aed] via-[#8b5cf6] to-[#a78bfa] bg-clip-text text-transparent">
                    {formatEUR(total)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Le paiement est sécurisé via Stripe. Vous recevrez un reçu par email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
