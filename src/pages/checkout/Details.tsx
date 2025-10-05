import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function toNumberSafe(v: any, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export default function CheckoutDetails() {
  const { state } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [note, setNote]           = useState("");
  const [consent, setConsent]     = useState(false);

  const items = Array.isArray(state.items) ? state.items : [];
  const total = useMemo(() => {
    return items.reduce((s, it) => {
      const p = toNumberSafe(it?.price_eur, 0);
      const q = Math.max(1, toNumberSafe(it?.quantity, 1));
      return s + p * q;
    }, 0);
  }, [items]);

  if (!items.length) {
    return (
      <div className="container mx-auto max-w-3xl py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Panier vide</h1>
        <p className="text-muted-foreground mb-6">Ajoute des articles avant de continuer.</p>
        <Button asChild><Link to="/shop">Retour à la boutique</Link></Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!firstName || !lastName) return setErr("Renseigne ton prénom et ton nom.");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return setErr("Email invalide.");
    if (!consent) return setErr("Tu dois accepter le traitement de tes données.");

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            note: note.trim(),
          },
          items: items.map(it => ({
            id: it.id,
            name: it.name,
            price_eur: it.price_eur,
            quantity: it.quantity,
            size: it.size,
            number: it.number,
            flocage: it.flocage,
            image_url: it.image_url,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        console.error("Checkout error:", data);
        setErr(data?.error || "Erreur de démarrage du paiement.");
        setLoading(false);
        return;
      }
      window.location.href = data.url; // Redirection Stripe
    } catch (e: any) {
      console.error(e);
      setErr("Erreur réseau.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Informations de commande</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulaire */}
        <Card className="border-border/20">
          <CardContent className="p-6 space-y-4">
            {err && <p className="text-sm text-red-500">{err}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Prénom *" value={firstName} onChange={e=>setFirstName(e.target.value)} />
                <Input placeholder="Nom *" value={lastName} onChange={e=>setLastName(e.target.value)} />
              </div>
              <Input type="email" placeholder="Email *" value={email} onChange={e=>setEmail(e.target.value)} />
              <Input placeholder="Téléphone (optionnel)" value={phone} onChange={e=>setPhone(e.target.value)} />
              <Textarea placeholder="Commentaire (optionnel)" value={note} onChange={e=>setNote(e.target.value)} />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1" />
                <span>J’accepte que mes informations soient utilisées pour traiter cette commande.</span>
              </label>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Redirection vers Stripe..." : "Continuer vers le paiement"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/checkout")}>
                  Retour au panier
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Livraison sous 2 mois • Retrait en main propre auprès du club.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Récapitulatif */}
        <Card className="border-border/20">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-lg">Récapitulatif</h2>
            <div className="space-y-3">
              {items.map(it => {
                const p = toNumberSafe(it?.price_eur, 0);
                const q = Math.max(1, toNumberSafe(it?.quantity, 1));
                return (
                  <div key={it.lineItemId} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {it.size ? <>Taille {it.size} • </> : null}
                        {it.number ? <>N° {it.number} • </> : null}
                        {it.flocage ? <>{it.flocage}</> : null}
                      </div>
                    </div>
                    <div className="text-sm">{(p*q).toFixed(2)}€</div>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 border-t border-border/20 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">{toNumberSafe(total,0).toFixed(2)}€</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
