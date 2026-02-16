
/**
 * Order Reconciliation Tool
 * 
 * Scans Stripe for paid checkout sessions and helps identify discrepancies
 * between Stripe payments and Google Sheets orders.
 * 
 * Usage:
 *   node --env-file=.env.local -r ts-node/register scripts/reconcile-orders.ts
 * 
 * This script is READ-ONLY by default. It will list all paid orders from Stripe
 * without making any changes to your Google Sheet.
 * 
 * Required environment variables:
 *   - STRIPE_SECRET_KEY
 *   - SHEET_ORDERS_WEBAPP_URL
 *   - SHEET_APP_TOKEN (optional, for future write operations)
 */

import Stripe from 'stripe';
import { randomUUID } from 'crypto';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SHEET_ORDERS_WEBAPP_URL = process.env.SHEET_ORDERS_WEBAPP_URL;
const SHEET_APP_TOKEN = process.env.SHEET_APP_TOKEN || process.env.APP_TOKEN || "";

if (!STRIPE_SECRET_KEY || !SHEET_ORDERS_WEBAPP_URL) {
  console.error('Missing environment variables.');
  console.error('Required: STRIPE_SECRET_KEY, SHEET_ORDERS_WEBAPP_URL');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);
const EXECUTE = process.argv.includes('--execute');

function parseDescription(desc: string) {
  const parts = desc.split(' • ');
  const size = parts.find(p => p.startsWith('Taille '))?.replace('Taille ', '') || 'INCONNU';
  const number = parts.find(p => p.startsWith('N° '))?.replace('N° ', '') || '';
  const flocage = parts.find(p => p.startsWith('Flocage '))?.replace('Flocage ', '') || '';
  return { size, number, flocage };
}

async function reconcile() {
  const startDate = new Date('2026-02-01T00:00:00Z');
  const endDate = new Date(); // Now

  console.log(`Scanning Stripe sessions from ${startDate.toISOString()} to now...`);
  
  const sessions = await stripe.checkout.sessions.list({
    created: { gte: Math.floor(startDate.getTime() / 1000) },
    limit: 100,
    expand: ['data.line_items', 'data.customer_details'],
  });

  const paidSessions = sessions.data.filter(s => s.payment_status === 'paid');
  console.log(`Found ${paidSessions.length} paid sessions.`);

  for (const session of paidSessions) {
    // Here we could check if order exists in sheet if we had read access
    // Since we don't, we just log found sessions.
    // In a real reconciliation tool, we would query the sheet first.
    
    console.log(`\nFound Order: ${session.metadata?.order_id || 'N/A'} (${session.id}) - ${session.amount_total!/100} ${session.currency.toUpperCase()}`);
    
    if (EXECUTE) {
        // Logic to push to sheet would go here
        // (omitted to avoid accidental duplicates during normal runs)
        console.log("Execution mode not fully implemented to prevent duplicates. Use manual recovery if needed.");
    }
  }
}

reconcile();
