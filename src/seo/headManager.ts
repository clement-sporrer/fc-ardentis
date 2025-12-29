export type HeadMetaTag = {
  name?: string;
  property?: string;
  content: string;
};

export type HeadLinkTag = {
  rel: string;
  href: string;
  hrefLang?: string;
};

export type HeadScriptTag = {
  type: "application/ld+json";
  json: unknown;
};

export type HeadSnapshot = {
  title?: string;
  metas: HeadMetaTag[];
  links: HeadLinkTag[];
  scripts: HeadScriptTag[];
};

function escAttr(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type HeadManager = {
  reset: () => void;
  setTitle: (title: string) => void;
  addMeta: (tag: HeadMetaTag) => void;
  addLink: (tag: HeadLinkTag) => void;
  addJsonLd: (json: unknown) => void;
  snapshot: () => HeadSnapshot;
  toHeadHtml: () => string;
  applyToDom: () => void;
};

export function createHeadManager(): HeadManager {
  const state: HeadSnapshot = {
    title: undefined,
    metas: [],
    links: [],
    scripts: [],
  };

  const reset = () => {
    state.title = undefined;
    state.metas = [];
    state.links = [];
    state.scripts = [];
  };

  const setTitle = (title: string) => {
    state.title = title;
  };

  const addMeta = (tag: HeadMetaTag) => {
    state.metas.push(tag);
  };

  const addLink = (tag: HeadLinkTag) => {
    state.links.push(tag);
  };

  const addJsonLd = (json: unknown) => {
    state.scripts.push({ type: "application/ld+json", json });
  };

  const snapshot = () => ({
    title: state.title,
    metas: [...state.metas],
    links: [...state.links],
    scripts: [...state.scripts],
  });

  const toHeadHtml = () => {
    const parts: string[] = [];
    if (state.title) parts.push(`<title>${escAttr(state.title)}</title>`);

    for (const m of state.metas) {
      if (m.name) parts.push(`<meta name="${escAttr(m.name)}" content="${escAttr(m.content)}" />`);
      else if (m.property) parts.push(`<meta property="${escAttr(m.property)}" content="${escAttr(m.content)}" />`);
    }

    for (const l of state.links) {
      const attrs = [
        `rel="${escAttr(l.rel)}"`,
        `href="${escAttr(l.href)}"`,
        l.hrefLang ? `hreflang="${escAttr(l.hrefLang)}"` : null,
      ].filter(Boolean);
      parts.push(`<link ${attrs.join(" ")} />`);
    }

    for (const s of state.scripts) {
      parts.push(`<script type="${s.type}">${JSON.stringify(s.json)}</script>`);
    }
    return parts.join("\n");
  };

  const applyToDom = () => {
    if (typeof document === "undefined") return;

    // Remove previous SEO-managed nodes.
    document.querySelectorAll("head [data-seo='true']").forEach((el) => el.remove());

    if (state.title) document.title = state.title;

    const head = document.head;
    for (const m of state.metas) {
      const el = document.createElement("meta");
      if (m.name) el.setAttribute("name", m.name);
      if (m.property) el.setAttribute("property", m.property);
      el.setAttribute("content", m.content);
      el.setAttribute("data-seo", "true");
      head.appendChild(el);
    }

    for (const l of state.links) {
      const el = document.createElement("link");
      el.setAttribute("rel", l.rel);
      el.setAttribute("href", l.href);
      if (l.hrefLang) el.setAttribute("hreflang", l.hrefLang);
      el.setAttribute("data-seo", "true");
      head.appendChild(el);
    }

    for (const s of state.scripts) {
      const el = document.createElement("script");
      el.setAttribute("type", s.type);
      el.setAttribute("data-seo", "true");
      el.text = JSON.stringify(s.json);
      head.appendChild(el);
    }
  };

  return {
    reset,
    setTitle,
    addMeta,
    addLink,
    addJsonLd,
    snapshot,
    toHeadHtml,
    applyToDom,
  };
}


