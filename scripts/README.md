# Scripts Documentation

This directory contains utility scripts for managing FC Ardentis orders and data.

## Order Reconciliation

### `reconcile-orders.ts`

Scans Stripe for paid sessions and helps identify missing orders in the Google Sheet.

**Usage:**

```bash
# List all paid orders from Stripe (since Feb 1, 2026)
node --env-file=.env.local -r ts-node/register scripts/reconcile-orders.ts
```

**What it does:**
- Fetches all paid Stripe checkout sessions from February 1, 2026 onwards
- Displays order details including customer info and amounts
- Useful for auditing and identifying discrepancies between Stripe and Google Sheets

**Required Environment Variables:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `SHEET_ORDERS_WEBAPP_URL` - Google Apps Script web app URL (for future features)

**Example Output:**

```
Scanning Stripe sessions from 2026-02-01T00:00:00.000Z to now...
Found 4 paid sessions.

Found Order: b98bc7be-e911-4906-a38c-702d5d12c84a (cs_live_a1...) - 55.99 EUR
Found Order: 27285b7f-7bf1-4a86-8892-a65b987d1040 (cs_live_a1...) - 55.99 EUR
...
```

## Other Scripts

### `generate-sitemap.mjs`

Generates the sitemap.xml file for SEO.

```bash
npm run generate:sitemap
```

### `prerender.mjs`

Pre-renders pages for better SEO and initial load performance.

```bash
npm run prerender
```

## Development Notes

- All TypeScript scripts use Node's experimental type stripping feature
- Scripts require Node.js >= 22.0.0
- Environment variables are loaded via `--env-file` flag
- Use `.env.local` for local development, never commit this file

## Recovery Procedures

### If Orders Are Missing from Google Sheet

1. **Verify the issue:**
   ```bash
   node --env-file=.env.local -r ts-node/register scripts/reconcile-orders.ts
   ```

2. **Check Google Apps Script logs:**
   - Open your Google Sheet
   - Go to Extensions → Apps Script
   - Click "Executions" in the left sidebar
   - Look for failed executions or errors

3. **Common causes:**
   - Apps Script timeout (orders over 30 seconds)
   - Network issues between Vercel and Google
   - Invalid JSON in request
   - Missing or incorrect `SHEET_APP_TOKEN`

4. **Manual recovery:**
   - Contact development team with the Stripe session IDs
   - Orders can be manually reconstructed from Stripe data
   - Note: Some details (sizes, customizations) may be lost if not in Stripe metadata

### If Emails Are Not Sending

1. **Update Apps Script code:**
   - Copy the latest code from `docs/data-sources.md`
   - Configure `ADMIN_EMAIL` at the top of the script
   - Ensure `APP_TOKEN` matches your `SHEET_APP_TOKEN` env var

2. **Deploy the update:**
   - Click "Deploy" → "Manage deployments"
   - Click the edit icon (pencil) on your active deployment
   - Select "New version"
   - Click "Deploy"

3. **Test:**
   - Make a test order on your site
   - Check both customer and admin email inboxes
   - Check spam folders if emails don't arrive

## Security Best Practices

- Never commit `.env.local` or any file containing secrets
- Rotate your `SHEET_APP_TOKEN` periodically
- Keep Stripe webhook secrets secure
- Use environment variables for all sensitive data
- Review Apps Script execution logs regularly for suspicious activity
