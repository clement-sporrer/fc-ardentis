import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneField } from "@/components/PhoneField";
import { CheckCircle2, Loader2, AlertCircle, Users, Handshake, Sparkles } from "lucide-react";
import { Seo } from "@/seo/Seo";
import { seoRejoindre } from "@/seo/seo.config";
import { logger } from "@/lib/logger";

type TypeProfil = "joueur" | "partenaire";

const WEBHOOK_URL = import.meta.env.VITE_JOIN_WEBHOOK_URL as string;

export default function Rejoindre() {
  const [type, setType] = useState<TypeProfil>("joueur");

  // Common fields
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  // Player specific
  const [dateNaissance, setDateNaissance] = useState("");
  const [posteSouhaite, setPosteSouhaite] = useState("");
  const [canal, setCanal] = useState("");

  // Partner specific
  const [entreprise, setEntreprise] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  // Common
  const [message, setMessage] = useState("");

  // State
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "ko">(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Honeypot
  const [websiteTrap, setWebsiteTrap] = useState("");

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

    if (websiteTrap.trim() !== "") {
      setSent("ok");
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
            type: "partenaire",
            prenom: prenom.trim(),
            nom: nom.trim(),
            email: email.trim(),
            telephone: telephone.trim(),
            entreprise: entreprise.trim(),
            site_web: siteWeb.trim(),
            message: message.trim(),
          };

    try {
      setSubmitting(true);
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });

      let json: unknown = {};
      try {
        json = await res.json();
      } catch (error) {
        logger.warn("Failed to parse response:", error);
      }

      if (res.ok && (json?.ok === true || json?.status === "success" || json?.result === "success")) {
        setSent("ok");
        resetForm();
      } else {
        setSent("ko");
        setErrorMsg(json?.error || "Erreur lors de l'envoi. Réessaie dans un instant.");
      }
    } catch {
      setSent("ko");
      setErrorMsg("Impossible de contacter le serveur. Vérifie ta connexion et réessaie.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 font-sport outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="min-h-screen">
      <Seo {...seoRejoindre()} />
      {/* Hero Section */}
      <section data-hero="true" className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-magenta/15 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-magenta/10 rounded-full blur-3xl" />
        
        <div className="container max-w-5xl mx-auto relative z-10 text-center pt-24 sm:pt-28 pb-16 sm:pb-20">
          <div className="flex items-center justify-center gap-4 mb-6 animate-rise-up">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-magenta" />
            <Sparkles className="h-8 w-8 text-magenta" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-magenta" />
          </div>
          
          <h1 className="font-display font-bold text-white leading-tight mb-4 animate-rise-up" style={{ animationDelay: "100ms" }}>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg">Nous</span>
            <span className="block text-display-sm sm:text-display-md md:text-display-lg text-gradient-magenta">rejoindre</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/70 font-sport max-w-2xl mx-auto animate-rise-up" style={{ animationDelay: "200ms" }}>
            Devenez joueur ou partenaire du FC Ardentis
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 sm:py-20 bg-gradient-section">
        <div className="container max-w-3xl mx-auto">
          <p className="text-muted-foreground font-sport mb-10 max-w-3xl">
            Candidatez pour rejoindre le <span className="font-semibold text-foreground">FC Ardentis</span> en tant que joueur,
            ou proposez un partenariat. Tous niveaux bienvenus — du débutant au confirmé.
          </p>

          {/* FAQ (content mirrors FAQPage JSON-LD for better UX + relevance) */}
          <div className="premium-card p-6 sm:p-8 mb-10">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-4">
              Questions fréquentes
            </h2>
            <div className="space-y-4 text-muted-foreground font-sport">
              <div>
                <h3 className="font-display font-bold text-foreground">Qui peut rejoindre le FC Ardentis ?</h3>
                <p className="mt-1">
                  Le FC Ardentis accueille les <strong>adultes de 18 ans et plus</strong>, tous niveaux confondus (débutant à confirmé).
                  L'essentiel : motivation, cohésion et respect.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Comment s'inscrire au club ?</h3>
                <p className="mt-1">
                  Remplissez le formulaire ci-dessous (joueur ou partenaire). Nous vous recontactons pour organiser un essai ou discuter du partenariat.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Où est situé le club ?</h3>
                <p className="mt-1">
                  Le FC Ardentis est basé en région parisienne. Entraînements à Colombes, compétition CFL.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Rythme entraînements et matchs ?</h3>
                <p className="mt-1">
                  Entraînements le dimanche à Colombes. Matchs CFL en semaine (lundi ou mercredi) en région parisienne. Le calendrier peut évoluer selon la saison.
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Le club accepte-t-il les débutants ?</h3>
                <p className="mt-1">
                  Oui ! Que vous soyez débutant ou expérimenté, le FC Ardentis vous accueille. L'important : l'état d'esprit et l'envie de progresser ensemble.
                </p>
              </div>
            </div>
          </div>
          {/* Profile Selector */}
          <div className="mb-10">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-4">
              Choisissez votre profil
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType("joueur")}
                className={`p-5 sm:p-6 rounded-2xl border-2 transition-all text-left ${
                  type === "joueur"
                    ? "border-primary bg-primary/10 shadow-lg"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${type === "joueur" ? "bg-primary/20" : "bg-muted"}`}>
                    <Users className={`h-5 w-5 ${type === "joueur" ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-display font-bold text-lg ${type === "joueur" ? "text-primary" : "text-foreground"}`}>
                    Joueur
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-sport">
                  Rejoindre l'équipe sur le terrain
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType("partenaire")}
                className={`p-5 sm:p-6 rounded-2xl border-2 transition-all text-left ${
                  type === "partenaire"
                    ? "border-magenta bg-magenta/10 shadow-lg"
                    : "border-border hover:border-magenta/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${type === "partenaire" ? "bg-magenta/20" : "bg-muted"}`}>
                    <Handshake className={`h-5 w-5 ${type === "partenaire" ? "text-magenta" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-display font-bold text-lg ${type === "partenaire" ? "text-magenta" : "text-foreground"}`}>
                    Partenaire
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-sport">
                  Devenir sponsor ou partenaire
                </p>
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="premium-card p-6 sm:p-8">
              <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
                Informations personnelles
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Prénom *</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className={inputClass}
                    placeholder="Ex. Antoine"
                    required
                  />
                </div>
                <div>
                  <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={inputClass}
                    placeholder="Ex. Durand"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="prenom@exemple.com"
                    required
                  />
                </div>
                <div>
                  <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Téléphone</label>
                  <PhoneField value={telephone} onChange={setTelephone} />
                </div>
              </div>
            </div>

            {/* Player Specific */}
            {type === "joueur" && (
              <div className="premium-card p-6 sm:p-8">
                <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm font-bold">2</span>
                  Informations sportives
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Date de naissance *</label>
                    <input
                      type="date"
                      value={dateNaissance}
                      onChange={(e) => setDateNaissance(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Poste préféré *</label>
                    <select
                      value={posteSouhaite}
                      onChange={(e) => setPosteSouhaite(e.target.value)}
                      className={inputClass}
                      required
                    >
                      <option value="">Sélectionnez</option>
                      <option>Gardien</option>
                      <option>Défenseur</option>
                      <option>Milieu</option>
                      <option>Attaquant</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Comment nous avez-vous connu ?</label>
                  <select
                    value={canal}
                    onChange={(e) => setCanal(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Sélectionnez</option>
                    <option>Instagram</option>
                    <option>TikTok</option>
                    <option>Google</option>
                    <option>Ami / bouche-à-oreille</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
            )}

            {/* Partner Specific */}
            {type === "partenaire" && (
              <div className="premium-card p-6 sm:p-8">
                <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg bg-magenta/10 flex items-center justify-center text-magenta text-sm font-bold">2</span>
                  Informations partenaire
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Entreprise *</label>
                    <input
                      type="text"
                      value={entreprise}
                      onChange={(e) => setEntreprise(e.target.value)}
                      className={inputClass}
                      placeholder="Nom de l'entreprise"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-sport text-sm text-muted-foreground mb-1.5 block">Site web</label>
                    <input
                      type="url"
                      value={siteWeb}
                      onChange={(e) => setSiteWeb(e.target.value)}
                      className={inputClass}
                      placeholder="https://exemple.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="premium-card p-6 sm:p-8">
              <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold">3</span>
                Message (optionnel)
              </h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder={
                  type === "joueur"
                    ? "Disponibilités, expérience, motivations..."
                    : "Type de partenariat envisagé, visibilité souhaitée..."
                }
              />
            </div>

            {/* Consent */}
            <div className="premium-card p-6 sm:p-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="accent-primary mt-1 h-5 w-5"
                />
                <span className="text-sm font-sport text-foreground/80">
                  J'accepte que mes données soient utilisées pour traiter ma demande et me recontacter
                  dans le cadre des activités du FC Ardentis. *
                </span>
              </label>

              {/* Honeypot */}
              <div className="hidden">
                <input
                  type="text"
                  value={websiteTrap}
                  onChange={(e) => setWebsiteTrap(e.target.value)}
                />
              </div>
            </div>

            {/* Status Messages */}
            {sent === "ok" && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="font-sport">Votre demande a bien été envoyée. Merci !</span>
              </div>
            )}
            {sent === "ko" && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-sport">{errorMsg || "Une erreur est survenue. Réessaie."}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={submitting || !requiredOK}
                variant="magenta"
                size="xl"
                className="min-w-[280px] rounded-xl"
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
