// api/stripe-webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

function buffer(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (c: any) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const secret = process.env.STRIPE_SECRET_KEY as string | undefined;
  if (!secret) return res.status(500).send("Missing STRIPE_SECRET_KEY");
  const stripe = new Stripe(secret);
  const sig = (req.headers["stripe-signature"] as string) || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const sheetUrl = process.env.SHEET_ORDERS_WEBAPP_URL as string;

  if (!webhookSecret) return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
  if (!sheetUrl) return res.status(500).send("Missing SHEET_ORDERS_WEBAPP_URL");
  if (!sig) return res.status(400).send("Missing Stripe signature header");

  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      const paymentIntent = session.payment_intent as string | null;

      if (orderId) {
        const token = process.env.SHEET_APP_TOKEN || process.env.APP_TOKEN || "";
        // Add timeout to prevent hanging on slow Apps Script responses
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
          await fetch(sheetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update_status",
              data: { order_id: orderId, payment_status: "paid", stripe_session_id: paymentIntent || "" },
              token,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (e: any) {
    console.error("Webhook handler failed:", e);
    return res.status(500).send("Webhook handler error");
  }
}
