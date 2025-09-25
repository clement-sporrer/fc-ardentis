import { useState } from "react";
import { Button } from "@/components/ui/button";
import PhoneField from "@/components/PhoneField";
import { CheckCircle2, Loader2 } from "lucide-react";

type TypeProfil = "joueur" | "partenaire";

const WEBHOOK_URL = import.meta.env.VITE_JOIN_WEBHOOK_URL as string;

export default function Rejoindre() {
  // type
  const [type, setType] = useState<TypeProfil>("joueur");

  // commun
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState(""); // reçu formaté depuis PhoneField
  const [message, setMessage] = useState("");

  // joueur
  const [dateNaissance, setDateNaissance] = useState("");
  const [poste, setPoste] = useState("");
  const [canal, setCanal] = useState("");

  // partenaire
  const [entreprise, setEntreprise] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  // divers
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "ko">(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // validation rapide
  const requiredOK =
    prenom.trim() !== "" &&
    email.trim() !== "" &&
    (type === "joueur"
      ? dateNaissance.trim() !== "" && poste.trim() !== ""
      : entreprise.trim() !== "") &&
    consent;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSent(null);

    if (!WEBHOOK_URL) {
      setErrorMsg(
        "Configuration manquante : VITE_JOIN_WEBHOOK_URL n'est pas défini."
      );
      setSent("ko");
      return;
    }

    if (!requiredOK) {
      setErrorMsg("Merci de compléter les champs requis.");
      setSent("ko");
      return;
    }

    const payload =
      type === "joueur"
        ? {
            type: "joueur",
            prenom: prenom.trim(),
            nom: nom.trim(),
            email: email.trim(),
            telephone: telephone.trim(),
            date_de_naissance: dateNaissance.trim(),
            poste_souhaite: poste.trim(),
            canal: canal.trim(),
            message: message.trim(),
          }
        : {
            type: "partenaire",
            prenom: prenom.trim(),
            nom: nom.trim(),
            email: email.trim(),
            telephone: telephone.trim(),
            entreprise: entreprise.trim(),
            site_web: siteWeb.trim(), // optionnel OK si vide
            message: message.trim(),
          };

    try {
      setSubmitting(true);
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({} as any));

      if (res.ok && (json.ok === true || json.status === "success")) {
        setSent("ok");
        // reset soft (on garde le type sélectionné)
        setPrenom("");
        setNom("");
        setEmail("");
        setTelephone("");
        setMessage("");
        setDateNaissance("");
        setPoste("");
        setCanal("");
        setEntreprise("");
        setSiteWeb("");
        setConsent(false);
      } else {
        setSent("ko");
        setErrorMsg(
          json?.error ||
            "Erreur inattendue pendant l’envoi. Réessayez dans un instant."
        );
      }
    } catch (err: any) {
      setSent("ko");
      setErrorMsg(
        "Impossible de contacter le serveur. Vérifie ta connexion ou réessaie."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // helpers UI
  const cardBase =
    "flex-1 rounded-2xl p-5 border transition-all cursor-pointer select-none";
  const cardActive =
    "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 ring-2 ring-primary/40";
  const cardInactive =
    "bg-card border-border hover:border-primary/40 hover:bg-primary/5";

  return (
    <div className="min-h-screen">
      {/* Hero (même logique que les autres pages) */}
      <section className="bg-gradient-hero py-20 md:py-28 px-4 text-center !mt-0">
        <div className="container max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-sport-condensed font-bold text-white mb-3">
            <span className="text-white">Nous </span>
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              rejoindre
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-sport max-w-3xl mx-auto">
            Devenez joueur ou partenaire du FC Ardentis.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 bg-gradient-section">
        <div className="container max-w-4xl mx-auto">
          {/* Sélecteur type – cartes cliquables */}
          <div className="mb-8">
            <h2 className="font-sport-condensed text-xl mb-3">Choisissez votre profil</h2>
            <div className="flex gap-4">
              <div
                className={`${cardBase} ${type === "joueur" ? cardActive : cardInactive}`}
                onClick={() => setType("joueur")}
                role="button"
                aria-pressed={type === "joueur"}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="joueur"
                    checked={type === "joueur"}
                    onChange={() => setType("joueur")}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="font-sport font-medium">Joueur</span>
                </label>
              </div>

              <div
                className={`${cardBase} ${type === "partenaire" ? cardActive : cardInactive}`}
                onClick={() => setType("partenaire")}
                role="button"
                aria-pressed={type === "partenaire"}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="partenaire"
                    checked={type === "partenaire"}
                    onChange={() => setType("partenaire")}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="font-sport font-medium">Partenaire</span>
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Bloc infos personnelles */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 space-y-5">
              <h3 className="font-sport-condensed text-lg">Informations personnelles</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="font-sport text-sm">Prénom *</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Ex. Antoine"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="font-sport text-sm">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Ex. Durand"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="font-sport text-sm">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="prenom@exemple.com"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="font-sport text-sm">Téléphone (optionnel)</label>
                  <PhoneField value={telephone} onChange={setTelephone} />
                </div>
              </div>
            </div>

            {/* Bloc spécifique JOUEUR */}
            {type === "joueur" && (
              <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 space-y-5">
                <h3 className="font-sport-condensed text-lg">Informations sportives</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="font-sport text-sm">Date de naissance *</label>
                    <input
                      type="date"
                      value={dateNaissance}
                      onChange={(e) => setDateNaissance(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="font-sport text-sm">Poste préféré *</label>
                    <select
                      value={poste}
                      onChange={(e) => setPoste(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                      required
                    >
                      <option value="">Sélectionnez un poste</option>
                      <option>Gardien</option>
                      <option>Défenseur</option>
                      <option>Milieu</option>
                      <option>Attaquant</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="font-sport text-sm">Comment nous avez-vous connu ?</label>
                    <select
                      value={canal}
                      onChange={(e) => setCanal(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="">Sélectionnez une option</option>
                      <option>Instagram</option>
                      <option>TikTok</option>
                      <option>Google</option>
                      <option>Ami / bouche-à-oreille</option>
                      <option>Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Bloc spécifique PARTENAIRE */}
            {type === "partenaire" && (
              <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 space-y-5">
                <h3 className="font-sport-condensed text-lg">Informations partenaire</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="font-sport text-sm">Entreprise *</label>
                    <input
                      type="text"
                      value={entreprise}
                      onChange={(e) => setEntreprise(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Nom de l’entreprise"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="font-sport text-sm">Site web (optionnel)</label>
                    <input
                      type="url"
                      value={siteWeb}
                      onChange={(e) => setSiteWeb(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="https://exemple.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message libre */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 space-y-5">
              <h3 className="font-sport-condensed text-lg">Message libre (optionnel)</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={
                  type === "joueur"
                    ? "Ajoute des précisions (disponibilités, expérience...)"
                    : "Parle-nous de ton intérêt (sponsoring maillots, visibilité, etc.)"
                }
              />
            </div>

            {/* Consentement */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="accent-primary mt-1"
                />
                <span className="text-sm font-sport text-foreground/90">
                  J’accepte que mes données personnelles soient utilisées pour traiter ma demande et me recontacter
                  dans le cadre des activités du FC Ardentis. Ces données ne seront pas transmises à des tiers. *
                </span>
              </label>
            </div>

            {/* Messages d’état */}
            {sent === "ok" && (
              <div className="flex items-center gap-2 text-green-600 font-sport">
                <CheckCircle2 className="h-5 w-5" />
                Votre demande a bien été envoyée. Merci !
              </div>
            )}
            {sent === "ko" && (
              <div className="text-red-600 font-sport">
                {errorMsg || "Une erreur est survenue. Réessayez."}
            </div>
            )}

            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={submitting || !requiredOK}
                className="px-6 py-6 text-base rounded-2xl min-w-[240px]"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Envoi en cours…
                  </span>
                ) : (
                  "Envoyer ma demande"
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
