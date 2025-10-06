// api/checkout.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

// Lazy Stripe init after env checks
let stripeSingleton: Stripe | null = null;
function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");
  stripeSingleton = new Stripe(secret);
  return stripeSingleton;
}

// --- Utils ---
function toNumberSafe(v: any, fallback = 0) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  // accepte "55,99" ou "55.99"
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function pickBaseUrl(req: VercelRequest): string {
  const fromHeader = (req.headers.origin as string) || "";
  const fromEnv = process.env.PUBLIC_BASE_URL || "";
  const fromVercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  return fromHeader || fromEnv || fromVercel || "https://fc-ardentis.vercel.app";
}

type Product = {
  id: string;
  name: string;
  type: string;
  price_eur: number;
  image1?: string;
  active: boolean;
  soldout: boolean;
};

// Parse CSV (tab ou virgule), en ignorant les lignes vides
function parseCsv(text: string): Product[] {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const items: Product[] = [];

  for (const line of lines.slice(1)) {
    // coupe sur TAB ou virgule, puis trim
    const v = line.split(/\t|,/).map((s) => s.trim());
    // On s'attend à 11 colonnes dans ton schéma produits
    // id, name, type, price_eur, image1..4, size_guide_url, active, soldout
    if (v.length < 11) continue;

    // prix tolérant avec "€" et virgules
    const price = toNumberSafe((v[3] || "").replace("€", ""), 0);

    items.push({
      id: (v[0] || "").toLowerCase(),
      name: v[1] || "",
      type: (v[2] || "").toLowerCase(),
      price_eur: price,
      image1: v[4] || "",
      active: (v[9] || "").toLowerCase() === "true",
      soldout: (v[10] || "").toLowerCase() === "true",
    });
  }
  return items;
}

async function loadCatalog(): Promise<Record<string, Product>> {
  const url = process.env.PRODUCTS_CSV_URL as string;
  if (!url) throw new Error("Missing PRODUCTS_CSV_URL");

  // Petit timeout pour éviter de bloquer indéfiniment si Google tarde
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);

  try {
    const res = await fetch(url, { method: "GET", signal: ac.signal });
    if (!res.ok) throw new Error(`CSV HTTP ${res.status}`);
    const text = await res.text();
    const list = parseCsv(text);
    const map: Record<string, Product> = {};
    for (const p of list) if (p.id) map[p.id] = p;
    return map;
  } finally {
    clearTimeout(t);
  }
}

function validateCustomer(c: any) {
  if (!c || typeof c !== "object") return "Missing customer";
  if (!c.first_name || !c.last_name) return "Missing customer name";
  if (!c.email || !/^\S+@\S+\.\S+$/.test(String(c.email))) return "Invalid email";
  return null;
}

// --- Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { customer, items } = req.body || {};

    // 0) Validation payload
    const customerErr = validateCustomer(customer);
    if (customerErr) return res.status(400).json({ error: customerErr });

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Cart empty" });
    }

    // 1) Recharger le catalogue serveur
    const catalog = await loadCatalog();

    // 2) Sanitize items (prix/nom/type/actif/soldout)
    const sanitized = items.map((it: any) => {
      const id = String(it?.id || "").toLowerCase();
      const p = catalog[id];
      if (!p) throw new Error(`PRODUCT_NOT_FOUND:${id}`);
      if (!p.active) throw new Error(`PRODUCT_INACTIVE:${id}`);
      if (p.soldout) throw new Error(`PRODUCT_SOLDOUT:${id}`);

      const qty = Math.max(1, toNumberSafe(it?.quantity, 1));
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        price_eur: p.price_eur, // prix côté serveur (source de vérité)
        quantity: qty,
        size: String(it?.size || ""),
        number: String(it?.number || ""),
        flocage: String(it?.flocage || ""),
        image_url: p.image1 || String(it?.image_url || ""),
      };
    });

    const total_eur = sanitized.reduce((s, it) => s + it.price_eur * it.quantity, 0);

    // 3) Créer la commande "pending" dans Google Sheet (Apps Script)
    const sheetUrl = process.env.SHEET_ORDERS_WEBAPP_URL as string;
    if (!sheetUrl) return res.status(500).json({ error: "Missing SHEET_ORDERS_WEBAPP_URL" });

    const orderPayload = {
      // modèle aligné sur l'Apps Script
      customer: {
        name: `${String(customer.first_name).trim()} ${String(customer.last_name).trim()}`.trim(),
        email: String(customer.email).trim(),
        phone: String(customer.phone || "").trim(),
        address: "", // pas collecté pour l'instant
      },
      notes: String(customer.note || "").trim(),
      items: sanitized,
      total_eur,
      created_at: new Date().toISOString(),
    };

    // Appel Apps Script robuste: tente JSON puis text/plain
    const sheetToken = process.env.SHEET_APP_TOKEN || process.env.APP_TOKEN || "";
    const baseBody = { action: "create_order", data: orderPayload, token: sheetToken } as const;
    async function postToSheetJSON() {
      const r = await fetch(sheetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain;q=0.9, */*;q=0.1",
          "User-Agent": "fc-ardentis/checkout (vercel)"
        },
        body: JSON.stringify(baseBody),
      });
      const bodyText = await r.text();
      let parsed: any = {};
      try { parsed = JSON.parse(bodyText); } catch {}
      return { ok: r.ok, status: r.status, text: bodyText, json: parsed };
    }

    async function postToSheetText() {
      const r = await fetch(sheetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Accept": "application/json, text/plain;q=0.9, */*;q=0.1",
          "User-Agent": "fc-ardentis/checkout (vercel)"
        }, // souvent plus simple pour Apps Script
        body: JSON.stringify(baseBody),
      });
      const bodyText = await r.text();
      let parsed: any = {};
      try { parsed = JSON.parse(bodyText); } catch {}
      return { ok: r.ok, status: r.status, text: bodyText, json: parsed };
    }

    function extractOrderId(obj: any, text: string): string {
      const direct = obj?.order_id || obj?.id || obj?.orderId || obj?.data?.order_id || obj?.data?.id;
      if (direct && typeof direct === "string") return direct;
      // Try to extract simple IDs from plain text like "order_id: 123" or first UUID/long number
      const patterns = [
        /order[_\s-]?id[\s:=]+([\w-]{6,})/i,
        /\bid[\s:=]+([\w-]{6,})/i,
        /\b([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\b/i,
        /\b(\d{6,})\b/,
      ];
      for (const re of patterns) {
        const m = text.match(re);
        if (m?.[1]) return m[1];
      }
      return "";
    }

    let sheetTry = await postToSheetJSON();
    let orderId: string = extractOrderId(sheetTry.json, sheetTry.text);
    if (!sheetTry.ok || !orderId) {
      // Retry en text/plain
      const sheetTry2 = await postToSheetText();
      orderId = extractOrderId(sheetTry2.json, sheetTry2.text) || orderId;
      if (!sheetTry2.ok || !orderId) {
        console.error("Sheet create_order failed", {
          status1: sheetTry.status,
          body1: sheetTry.text?.slice(0, 500),
          status2: sheetTry2.status,
          body2: sheetTry2.text?.slice(0, 500),
        });
        return res.status(502).json({ error: "Sheet create_order failed", detail: {
          status1: sheetTry.status,
          body1: sheetTry.text?.slice(0, 200),
          status2: sheetTry2.status,
          body2: sheetTry2.text?.slice(0, 200),
          hint: "Ensure SHEET_ORDERS_WEBAPP_URL is the deployed Web App /exec URL and returns JSON with order_id"
        }});
      }
    }

    // 4) Créer la session Stripe Checkout
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = sanitized.map((it) => {
      const desc: string[] = [];
      if (it.size) desc.push(`Taille ${it.size}`);
      if (it.number) desc.push(`N° ${it.number}`);
      if (it.flocage) desc.push(`Flocage ${it.flocage}`);

      return {
        quantity: it.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(it.price_eur * 100), // cents
          product_data: {
            name: it.name,
            description: desc.join(" • ") || undefined,
            images: it.image_url ? [it.image_url] : undefined,
          },
        },
      };
    });

    const baseUrl = pickBaseUrl(req);
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata: { order_id: orderId },
      success_url: `${baseUrl}/checkout/success?order=${encodeURIComponent(orderId)}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      // Tu peux aussi collecter l'email côté Stripe si tu veux un reçu mieux personnalisé :
      // customer_email: orderPayload.customer.email || undefined,
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    // Erreurs "métier" prévisibles → 400
    const msg = String(e?.message || e);
    if (msg.startsWith("PRODUCT_") || msg.includes("not found") || msg.includes("inactive") || msg.includes("soldout")) {
      console.warn("Checkout 400:", msg);
      return res.status(400).json({ error: msg });
    }
    console.error("Checkout 500:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
