import { toAbsoluteUrl } from "./site";

const OG_IMAGE = "/assets/logo.png";

// ============================================================================
// STRUCTURED DATA HELPERS
// ============================================================================

function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: toAbsoluteUrl(it.path),
    })),
  };
}

function faqJsonLd(questions: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// Complete SportsTeam schema with all location keywords for max SEO
function sportsTeamJsonLd(includeContact = false) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "@id": toAbsoluteUrl("/#organization"),
    name: "FC Ardentis",
    alternateName: ["FC Ardentis Paris", "FC Ardentis Colombes", "Ardentis Football Club"],
    url: toAbsoluteUrl("/"),
    logo: toAbsoluteUrl(OG_IMAGE),
    image: toAbsoluteUrl(OG_IMAGE),
    sport: "Football",
    foundingDate: "2025",
    description:
      "Club de football amateur loisir pour adultes (+18 ans) basé à Colombes (92), Hauts-de-Seine. Compétition CFL Paris, entraînements en Île-de-France.",
    slogan: "Cohésion, Respect, Performance",
    // Location with full address details for local SEO
    location: {
      "@type": "Place",
      name: "Stade Yves-du-Manoir, Colombes",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Stade Yves-du-Manoir",
        addressLocality: "Colombes",
        postalCode: "92700",
        addressRegion: "Hauts-de-Seine",
        addressCountry: "FR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 48.9293,
        longitude: 2.2454,
      },
    },
    // Multiple areas served for broader reach
    areaServed: [
      { "@type": "City", name: "Colombes" },
      { "@type": "City", name: "Paris" },
      { "@type": "AdministrativeArea", name: "Hauts-de-Seine" },
      { "@type": "AdministrativeArea", name: "Île-de-France" },
      { "@type": "AdministrativeArea", name: "92" },
    ],
    // Keywords for search engines
    keywords:
      "club foot Colombes, football amateur Paris, club foot 92, football loisir adulte, club foot Hauts-de-Seine, football amateur Île-de-France, CFL Paris, club foot amateur Paris, rejoindre club foot Paris, football adulte 18+",
    // Social links
    sameAs: ["https://www.instagram.com/fc_ardentis/", "https://www.tiktok.com/@fc_ardentis"],
    ...(includeContact
      ? {
          email: "fcardentis@gmail.com",
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "fcardentis@gmail.com",
              availableLanguage: ["fr"],
            },
          ],
        }
      : {}),
    // Member info
    member: {
      "@type": "OrganizationRole",
      member: {
        "@type": "Organization",
        name: "Commission de Football Loisir (CFL Paris)",
        url: "https://www.cflparis.fr/",
      },
      roleName: "Membre",
    },
  };
}

// ============================================================================
// PAGE SEO CONFIGS
// ============================================================================

export function seoIndex() {
  return {
    title: "FC Ardentis — Club de football amateur à Colombes (92) | Paris & Île-de-France",
    description:
      "FC Ardentis : club de foot amateur loisir pour adultes (+18 ans) à Colombes, Hauts-de-Seine (92). Entraînements le dimanche, compétition CFL Paris. Rejoignez-nous !",
    canonicalPath: "/",
    ogImagePath: OG_IMAGE,
    jsonLd: [
      sportsTeamJsonLd(),
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FC Ardentis",
        alternateName: "FC Ardentis Paris",
        url: toAbsoluteUrl("/"),
        potentialAction: {
          "@type": "SearchAction",
          target: `${toAbsoluteUrl("/shop")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      breadcrumbJsonLd([{ name: "Accueil", path: "/" }]),
    ],
  };
}

export function seoEquipe() {
  return {
    title: "Notre équipe — Joueurs FC Ardentis | Club foot amateur Colombes (92)",
    description:
      "Découvrez l'effectif du FC Ardentis : joueurs, postes et profils. Club de football amateur adulte à Colombes (92), Hauts-de-Seine, Île-de-France.",
    canonicalPath: "/equipe",
    ogImagePath: OG_IMAGE,
    jsonLd: [breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Équipe", path: "/equipe" }])],
  };
}

export function seoCalendrier() {
  return {
    title: "Calendrier & résultats — Matchs FC Ardentis | CFL Paris 92",
    description:
      "Calendrier des matchs et entraînements du FC Ardentis (CFL Paris). Dates, horaires, résultats. Club foot amateur Colombes (92), Hauts-de-Seine.",
    canonicalPath: "/calendrier",
    ogImagePath: OG_IMAGE,
    jsonLd: [breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Calendrier", path: "/calendrier" }])],
  };
}

export function seoVideos() {
  return {
    title: "Vidéos — Replays et matchs en direct | FC Ardentis",
    description:
      "Regardez les replays des matchs et les directs du FC Ardentis. Club de football amateur à Colombes (92), Hauts-de-Seine.",
    canonicalPath: "/videos",
    ogImagePath: OG_IMAGE,
    jsonLd: [breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Vidéos", path: "/videos" }])],
  };
}

export function seoContacts() {
  return {
    title: "Contact — FC Ardentis | Club foot amateur Colombes 92 Paris",
    description:
      "Contactez le FC Ardentis : email, réseaux sociaux, localisation. Club de football amateur loisir adulte (+18 ans) à Colombes (92), Hauts-de-Seine.",
    canonicalPath: "/contacts",
    ogImagePath: OG_IMAGE,
    jsonLd: [
      sportsTeamJsonLd(true),
      breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Contacts", path: "/contacts" }]),
      faqJsonLd([
        {
          question: "Comment contacter le FC Ardentis ?",
          answer:
            "Écrivez à fcardentis@gmail.com ou contactez-nous via Instagram (@fc_ardentis). Nous répondons généralement sous 48h.",
        },
        {
          question: "Où se trouve le FC Ardentis ?",
          answer:
            "Le FC Ardentis est basé à Colombes (92), dans les Hauts-de-Seine, en Île-de-France. Les entraînements ont lieu au Stade Yves-du-Manoir et les matchs en région parisienne.",
        },
        {
          question: "Peut-on venir faire un essai au club ?",
          answer:
            "Oui ! Contactez-nous avec votre profil (poste, expérience, disponibilités) et nous vous proposerons un créneau d'essai. Le club est ouvert aux adultes de 18 ans et plus.",
        },
        {
          question: "Quel est le public visé par le FC Ardentis ?",
          answer:
            "Le FC Ardentis est un club de football amateur loisir réservé aux adultes (18 ans et plus). Nous accueillons tous les niveaux, du débutant au confirmé, dans un esprit de cohésion et de respect.",
        },
      ]),
    ],
  };
}

export function seoRejoindre() {
  return {
    title: "Rejoindre le FC Ardentis — Club foot amateur adulte Paris 92",
    description:
      "Rejoignez le FC Ardentis ! Club de football amateur loisir pour adultes (+18 ans) à Colombes (92). Candidature joueur ou partenaire. Entraînements en Île-de-France.",
    canonicalPath: "/rejoindre",
    ogImagePath: OG_IMAGE,
    jsonLd: [
      breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Nous rejoindre", path: "/rejoindre" }]),
      faqJsonLd([
        {
          question: "Qui peut rejoindre le FC Ardentis ?",
          answer:
            "Le FC Ardentis accueille les adultes de 18 ans et plus, tous niveaux confondus (débutant à confirmé). L'essentiel : motivation, cohésion et respect.",
        },
        {
          question: "Comment s'inscrire au FC Ardentis ?",
          answer:
            "Remplissez le formulaire « Nous rejoindre » sur le site (joueur ou partenaire). Nous vous recontactons pour organiser un essai ou discuter du partenariat.",
        },
        {
          question: "À quel rythme sont les entraînements et matchs ?",
          answer:
            "Entraînements le dimanche à Colombes (92). Matchs CFL en semaine (lundi ou mercredi) en région parisienne. Le calendrier peut évoluer selon la saison.",
        },
        {
          question: "Le club est-il ouvert aux débutants ?",
          answer:
            "Oui ! Que vous soyez débutant ou expérimenté, le FC Ardentis vous accueille. L'important est l'état d'esprit : envie de progresser, respect des coéquipiers et des adversaires.",
        },
        {
          question: "Où est situé le FC Ardentis ?",
          answer:
            "Le club est basé à Colombes (92), dans les Hauts-de-Seine, en Île-de-France. C'est un club de football amateur parisien participant à la CFL.",
        },
      ]),
    ],
  };
}

export function seoShop() {
  return {
    title: "Boutique officielle FC Ardentis — Maillots club foot Paris 92",
    description:
      "Boutique officielle du FC Ardentis : maillots, shorts et équipements du club de foot amateur de Colombes (92). Personnalisation (taille, flocage, numéro).",
    canonicalPath: "/shop",
    ogImagePath: OG_IMAGE,
    jsonLd: [breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Boutique", path: "/shop" }])],
  };
}

export function seoProduct(product?: {
  id: string;
  name: string;
  price_eur?: number;
  image1?: string;
  soldout?: boolean;
}) {
  const name = product?.name?.trim() || "Produit";
  const id = (product?.id || "").trim();
  const price = typeof product?.price_eur === "number" ? product.price_eur : undefined;
  const canonicalPath = `/shop/${encodeURIComponent(id)}`;
  const image = product?.image1 ? product.image1 : OG_IMAGE;
  return {
    title: `${name} | Boutique FC Ardentis — Club foot Colombes 92`,
    description:
      price != null
        ? `${name} — Boutique officielle FC Ardentis (club foot amateur Paris 92). Prix: ${price.toFixed(2)}€. Personnalisation possible.`
        : `${name} — Boutique officielle FC Ardentis (club foot amateur Paris 92). Personnalisation possible (taille, flocage).`,
    canonicalPath,
    ogType: "product" as const,
    ogImagePath: image,
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Accueil", path: "/" },
        { name: "Boutique", path: "/shop" },
        { name, path: canonicalPath },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        image: [toAbsoluteUrl(image)],
        brand: { "@type": "Brand", name: "FC Ardentis" },
        offers: {
          "@type": "Offer",
          url: toAbsoluteUrl(canonicalPath),
          priceCurrency: "EUR",
          ...(price != null ? { price: price.toFixed(2) } : {}),
          availability: product?.soldout ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        },
      },
    ],
  };
}

export function seoCheckout(title: string, canonicalPath: string) {
  return {
    title,
    description: "Commande et paiement sécurisés via Stripe.",
    canonicalPath,
    ogImagePath: OG_IMAGE,
    robots: { index: false, follow: false as const },
  };
}

export function seoNotFound() {
  return {
    title: "Page introuvable | FC Ardentis",
    description: "La page demandée est introuvable. Retournez sur le site officiel du FC Ardentis.",
    canonicalPath: "/404",
    ogImagePath: OG_IMAGE,
    robots: { index: false, follow: false as const },
    jsonLd: [breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "404", path: "/404" }])],
  };
}

export function seoCfl() {
  return {
    title: "CFL Paris — Football loisir adulte | FC Ardentis Colombes 92",
    description:
      "Le FC Ardentis participe à la CFL (Commission de Football Loisir) Paris. Club de foot amateur loisir adulte (+18 ans) à Colombes (92), Hauts-de-Seine.",
    canonicalPath: "/cfl",
    ogImagePath: OG_IMAGE,
    jsonLd: [
      breadcrumbJsonLd([
        { name: "Accueil", path: "/" },
        { name: "CFL", path: "/cfl" },
      ]),
      faqJsonLd([
        {
          question: "Qu'est-ce que la CFL Paris ?",
          answer:
            "La CFL (Commission de Football Loisir) est une compétition de football amateur pour adultes en région parisienne. Elle regroupe des clubs loisir qui jouent en semaine.",
        },
        {
          question: "Le FC Ardentis joue-t-il en CFL ?",
          answer:
            "Oui, le FC Ardentis est membre de la CFL Paris. Nous participons aux matchs officiels en semaine (lundi ou mercredi) dans différents stades d'Île-de-France.",
        },
        {
          question: "Comment rejoindre un club CFL comme le FC Ardentis ?",
          answer:
            "Rendez-vous sur la page « Nous rejoindre » et remplissez le formulaire joueur. Nous vous recontacterons pour organiser un essai. Le club est ouvert aux adultes (18+) de tous niveaux.",
        },
      ]),
    ],
  };
}
