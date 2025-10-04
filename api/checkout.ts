// api/checkout.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

function toNumberSafe(v: any, fallback = 0) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

type Product = {
  id: string; name: string; type: string; price_eur: number;
  image1?: string; active: boolean; soldout: boolean;
};

function parseCsv(text: string): Product[] {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const items: Product[] = [];
  for (const line of lines.slice(1)) {
    const v = line.split(/\t|,/).map(s => s.trim());
    if (v.length < 11) continue;
    const price = toNumberSafe((v[3] || "").replace("€",""), 0);
    items.push({
      id: (v[0]||"").toLowerCase(),
      name: v[1]||"",
      type: (v[2]||"").toLowerCase(),
      price_eur: price,
      image1: v[4]||"",
      active: (v[9]||"").toLowerCase() === "true",
      soldout: (v[10]||"").toLowerCase() === "true",
    });
  }
  return items;
}

async function loadCatalog(): Promise<Record<string, Product>> {
  const url = process.env.PRODUCTS_CSV_URL as string;
  if (!url) throw new Error("Missing PRODUCTS_CSV_URL");
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  const list = parseCsv(text);
  const map: Record<string, Product> = {};
  for (const p of list) if (p.id) map[p.id] = p;
  return map;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const origin = (req.headers.origin as string) || process.env.PUBLIC_BASE_URL || "";
    const { customer, items } = req.body || {};
    if (!customer || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // 1) Recharger le catalogue pour sécuriser les prix/noms/types
    const catalog = await loadCatalog();

    // 2) Sanitize items depuis le serveur
    const sanitized = items.map((it: any) => {
      const p = catalog[String(it.id || "").toLowerCase()];
      if (!p || !p.active || p.soldout) {
        throw new Error(`Produit indisponible: ${it.id}`);
      }
      const qty = Math.max(1, toNumberSafe(it.quantity, 1));
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        price_eur: p.price_eur,              // prix serveur, pas celui du client
        quantity: qty,
        size: String(it.size || ""),
        number: String(it.number || ""),
        flocage: String(it.flocage || ""),
        image_url: p.image1 || String(it.image_url || ""),
      };
    });

    const total_eur = sanitized.reduce((s, it) => s + it.price_eur * it.quantity, 0);

    // 3) Créer commande "pending" dans Google Sheet (Apps Script)
    const sheetUrl = process.env.SHEET_ORDERS_WEBAPP_URL as string;
    if (!sheetUrl) throw new Error("Missing SHEET_ORDERS_WEBAPP_URL");

    const orderPayload = {
      customer,
      items: sanitized,
      total_eur,
      created_at: new Date().toISOString(),
    };

    const sheetRes = await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_order", data: orderPayload }),
    });
    const sheetJson = await sheetRes.json().catch(() => ({} as any));

    const orderId: string = sheetJson?.order_id || sheetJson?.id || "";
    if (!sheetRes.ok || !orderId) {
      console.error("Sheet create_order failed:", sheetJson);
      return res.status(500).json({ error: "Sheet create_order failed" });
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
          unit_amount: Math.round(it.price_eur * 100),
          product_data: {
            name: it.name,
            description: desc.join(" • ") || undefined,
            images: it.image_url ? [it.image_url] : undefined,
          },
        },
      };
    });

    const successBase = origin || "https://www.fcardentis.fr";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      metadata: { order_id: orderId },
      success_url: `${successBase}/checkout/success?order=${encodeURIComponent(orderId)}`,
      cancel_url: `${successBase}/checkout`,
      // Optionnel : collecte email Stripe aussi
      // customer_email: customer?.email || undefined,
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
}
