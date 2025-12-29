import { useEffect } from "react";
import { useHeadManager } from "./HeadProvider";
import { toAbsoluteUrl } from "./site";

export type SeoRobots = {
  index?: boolean;
  follow?: boolean;
};

export type SeoProps = {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: "website" | "article" | "product";
  ogImagePath?: string; // absolute or path
  robots?: SeoRobots;
  jsonLd?: unknown[];
};

function robotsToContent(r?: SeoRobots): string {
  const index = r?.index === false ? "noindex" : "index";
  const follow = r?.follow === false ? "nofollow" : "follow";
  return `${index}, ${follow}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
}

function normalizeOgImage(ogImagePath?: string): string | undefined {
  if (!ogImagePath) return undefined;
  if (ogImagePath.startsWith("http://") || ogImagePath.startsWith("https://")) return ogImagePath;
  return toAbsoluteUrl(ogImagePath.startsWith("/") ? ogImagePath : `/${ogImagePath}`);
}

export function Seo(props: SeoProps) {
  const head = useHeadManager();

  // Build a full snapshot each render.
  head.reset();
  head.setTitle(props.title);
  head.addMeta({ name: "description", content: props.description });
  head.addMeta({ name: "robots", content: robotsToContent(props.robots) });

  const canonicalUrl = toAbsoluteUrl(props.canonicalPath);
  head.addLink({ rel: "canonical", href: canonicalUrl });
  head.addLink({ rel: "alternate", href: canonicalUrl, hrefLang: "fr-FR" });
  head.addLink({ rel: "alternate", href: canonicalUrl, hrefLang: "x-default" });

  // OpenGraph
  head.addMeta({ property: "og:type", content: props.ogType ?? "website" });
  head.addMeta({ property: "og:url", content: canonicalUrl });
  head.addMeta({ property: "og:title", content: props.title });
  head.addMeta({ property: "og:description", content: props.description });
  head.addMeta({ property: "og:locale", content: "fr_FR" });
  head.addMeta({ property: "og:site_name", content: "FC Ardentis" });
  const ogImage = normalizeOgImage(props.ogImagePath);
  if (ogImage) {
    head.addMeta({ property: "og:image", content: ogImage });
    head.addMeta({ property: "og:image:width", content: "1200" });
    head.addMeta({ property: "og:image:height", content: "630" });
  }

  // Twitter
  head.addMeta({ name: "twitter:card", content: "summary_large_image" });
  head.addMeta({ name: "twitter:url", content: canonicalUrl });
  head.addMeta({ name: "twitter:title", content: props.title });
  head.addMeta({ name: "twitter:description", content: props.description });
  if (ogImage) head.addMeta({ name: "twitter:image", content: ogImage });

  // JSON-LD
  for (const json of props.jsonLd ?? []) head.addJsonLd(json);

  useEffect(() => {
    head.applyToDom();
  });

  return null;
}


