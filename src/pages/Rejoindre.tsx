import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneField } from "@/components/PhoneField";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

type TypeProfil = "joueur" | "partenaire";

const WEBHOOK_URL = import.meta.env.VITE_JOIN_WEBHOOK_URL as string;

export default function Rejoindre() {
  // Sélection du type
  const [type, setType] = useState<TypeProfil>("joueur");

  // Champs communs
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // Spécifique joueur
  const [dateNaissance, setDateNaissance] = useState("");
  const [posteSouhaite, setPosteSouhaite] = useState("");
  const [canal, setCanal] = useState("");

  // Spécifique partenaire
  const [entreprise, setEntreprise] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  // Commun
  const [message, setMessage] = useState("");

  // RGPD / état
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "ko">(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Honeypot anti-bot
  const [websiteTrap, setWebsiteTrap] = useState("");

  // Validation minimale alignée avec l’Apps Script (type/prenom/email requis + champs métier)
  const requiredOK =
    consent &&
    prenom.trim() !== "" &&
    email.trim() !== "" &&
    (type === "joueur"
      ? dateNaissance.trim() !== "" && posteSouhaite.trim() !== ""
      : entreprise.trim() !== "");

  const resetForm = () => {
    setPrenom("");
    setNom("");
    setEmail("");
    setTelephone("");
    setDateNaissance("");
    setPosteSouhaite("");
    setCanal("");
    setEntreprise("");
    setSiteWeb("");
    setMessage("");
    setConsent(false);
    setWebsiteTrap("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(null);
    setErrorMsg("");

    if (!WEBHOOK_URL) {
      setSent("ko");
      setErrorMsg("Configuration manquante : VITE_JOIN_WEBHOOK_URL n'est pas défini.");
      return;
    }

    // Honeypot: si rempli → stop (probable bot)
    if (websiteTrap.trim() !== "") {
      setSent("ok"); // on fait comme si tout allait bien pour ne pas donner d'indice aux bots
      resetForm();
      return;
    }

    if (!requiredOK) {
      setSent("ko");
      setErrorMsg("Merci de compléter les champs requis.");
      return;
    }

    const payload =
      type === "joueur"
        ? {
            // Schéma EXACT attendu par l’Apps Script (onglet Joueurs)
            type: "joueur",
            prenom: prenom.trim(),
            nom: nom.trim(),
            email: email.trim(),
            telephone: telephone.trim(),
            date_de_naissance: dateNaissance.trim(),
            poste_souhaite: posteSouhaite.trim(),
            canal: canal.trim(),
            message: message.trim(),
          }
        : {
            // Schéma EXACT attendu par l’Apps Script (onglet Partenaires)
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
        headers: { "Content-Type": "text/plain" }, // évite le préflight CORS
        body: JSON.stringify(payload),
      });

      // L’Apps Script renvoie { ok: true } ou { ok:false, error:"..." }
      let json: any = {};
      try {
        json = await res.json();
      } catch {
        // si pas de JSON (rare), on tolère ok via res.ok
      }

      if (res.ok && (json?.ok === true || json?.status === "success" || json?.result === "success")) {
        setSent("ok");
        resetForm();
      } else {
        setSent("ko");
        setErrorMsg(json?.error || "Erreur lors de l’envoi. Réessaie dans un instant.");
      }
    } catch (err) {
      setSent("ko");
      setErrorMsg("Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    } finally {
      setSubmitting(false);
    }
  };

  // Styles cartes cliquables
  const cardBase =
    "flex-1 rounded-2xl p-5 border transition-all cursor-pointer select-none focus:outline-none";
  const cardActive =
    "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 ring-2 ring-primary/40";
  const cardInactive =
    "bg-card border-border hover:border-primary/40 hover:bg-primary/5";

  return (
    <div className="min-h-screen">
      {/* Hero section (cohérente avec les autres pages) */}
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
          {/* Sélecteur de profil */}
          <div className="mb-8">
            <h2 className="font-sport-condensed text-xl mb-3">Choisissez votre profil</h2>
            <div className="flex gap-4">
              <div
                className={`${cardBase} ${type === "joueur" ? cardActive : cardInactive}`}
                onClick={() => setType("joueur")}
                role="button"
                aria-pressed={type === "joueur"}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setType("joueur") : null)}
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
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setType("partenaire") : null)}
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
                      value={posteSouhaite}
                      onChange={(e) => setPosteSouhaite(e.target.value)}
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

            {/* RGPD + honeypot */}
            <div className="rounded-2xl bg-card border border-border/60 shadow-card p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="accent-primary mt-1"
                />
                <span className="text-sm font-sport text-foreground/90">
                  J’accepte que mes données soient utilisées pour traiter ma demande et me recontacter
                  dans le cadre des activités du FC Ardentis. *
                </span>
              </label>

              {/* Champ honeypot invisible pour bots */}
              <div className="hidden">
                <label>Website</label>
                <input
                  type="text"
                  value={websiteTrap}
                  onChange={(e) => setWebsiteTrap(e.target.value)}
                />
              </div>
            </div>

            {/* Messages d’état */}
            {sent === "ok" && (
              <div className="flex items-center gap-2 text-green-600 font-sport">
                <CheckCircle2 className="h-5 w-5" />
                Votre demande a bien été envoyée. Merci !
              </div>
            )}
            {sent === "ko" && (
              <div className="flex items-center gap-2 text-red-600 font-sport">
                <AlertCircle className="h-5 w-5" />
                {errorMsg || "Une erreur est survenue. Réessaie."}
              </div>
            )}

            {/* Submit */}
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
