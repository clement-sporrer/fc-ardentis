# Order Recovery Summary - February 16, 2026

## Issue Identified

Customers were purchasing items on the website, but:
1. Orders were not appearing in the Google Sheet
2. Customers were not receiving confirmation emails

## Root Cause

The Google Apps Script handling orders was missing:
- Email notification functionality
- Proper error handling
- Duplicate prevention logic
- Support for pre-specified order IDs (needed for recovery)

## Actions Taken

### 1. Order Recovery ✅

Successfully recovered **4 missing orders** from Stripe (Feb 13-16, 2026):

| Date | Customer | Email | Amount | Order ID |
|------|----------|-------|--------|----------|
| Feb 15 | Zernadji | maissane.zernadji07@gmail.com | 55.99 € | 19c9dab3-e8de-4512-bb48-177eeef2df3c |
| Feb 14 | Matteo Souchay | matteo.souchay@gmail.com | 55.99 € | 23afc307-b125-40c3-ba28-0e22334e831a |
| Feb 13 | Kerherve Paul | kerhervepaul@gmail.com | 88.98 € | b086af0c-497e-4c17-b42b-e1caa5533d24 |
| Feb 13 | Nassim Salah | nassim.salah.pro@gmail.com | 55.99 € | d35d36f6-6a91-4c56-bcbe-614fc488f006 |

**Note:** These orders have been marked as "paid" in the Google Sheet. However, size/customization details were not stored in Stripe metadata, so they appear as "INCONNU (Contactez client)" in the sheet. You should contact these customers to confirm their size preferences.

### 2. Documentation Updates ✅

Updated [`docs/data-sources.md`](docs/data-sources.md) with improved Google Apps Script code that includes:

- **Email Notifications:**
  - Customer confirmation emails with order details
  - Admin notification emails for new orders
  - Payment confirmation emails when orders are marked as paid

- **Security Improvements:**
  - Token-based authentication (`APP_TOKEN`)
  - Request validation
  - Better error handling and logging

- **Duplicate Prevention:**
  - Checks for existing order IDs before inserting
  - Returns existing order ID if duplicate detected

- **Recovery Support:**
  - Accepts pre-specified order IDs (crucial for recovery scripts)
  - Allows setting initial payment status

### 3. Tools Created ✅

Created [`scripts/reconcile-orders.ts`](scripts/reconcile-orders.ts):
- Scans Stripe for all paid sessions since Feb 1, 2026
- Helps identify discrepancies between Stripe and Google Sheets
- Read-only by default (safe to run anytime)
- Documented in [`scripts/README.md`](scripts/README.md)

## Next Steps (Action Required)

### 1. Update Google Apps Script

You need to update your Google Apps Script with the new code:

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Copy the new code from [`docs/data-sources.md`](docs/data-sources.md) (section "Apps Script Setup")
4. **Configure these constants at the top:**
   ```javascript
   const ADMIN_EMAIL = 'your-email@example.com'; // Your email
   const APP_TOKEN = 'your-secret-token-here';   // Must match SHEET_APP_TOKEN env var
   ```
5. Click **Deploy → Manage deployments**
6. Click the edit icon (pencil) on your active deployment
7. Select **"New version"**
8. Click **Deploy**

### 2. Verify Environment Variable

Ensure your `.env.local` (and Vercel environment) has:

```env
SHEET_APP_TOKEN=your-secret-token-here
```

This must match the `APP_TOKEN` in your Apps Script code.

### 3. Contact Recovered Order Customers

The 4 recovered orders are missing size information. Contact these customers:

- **Zernadji** (maissane.zernadji07@gmail.com) - 1x Maillot Édition Spéciale
- **Matteo Souchay** (matteo.souchay@gmail.com) - 1x Maillot Édition Spéciale
- **Kerherve Paul** (kerhervepaul@gmail.com) - 1x Maillot + 1x Short Édition Spéciale
- **Nassim Salah** (nassim.salah.pro@gmail.com) - 1x Maillot Domicile

Ask them to confirm their sizes and any customization (number, flocage).

### 4. Test the System

After updating the Apps Script:

1. Make a test order on your website
2. Verify the order appears in Google Sheet
3. Check that you receive the admin notification email
4. Check that the customer receives the confirmation email
5. Check spam folders if emails don't arrive

## Files Modified

- [`docs/data-sources.md`](docs/data-sources.md) - Updated with new Apps Script code
- [`scripts/reconcile-orders.ts`](scripts/reconcile-orders.ts) - New reconciliation tool
- [`scripts/README.md`](scripts/README.md) - Documentation for scripts

## Files Created (Temporary, Now Deleted)

These were used during recovery and have been cleaned up:
- `scripts/recover-orders.ts` (deleted)
- `scripts/simulate-recovery.ts` (deleted)
- `scripts/perform-recovery.ts` (deleted)
- `scripts/finalize-recovery.ts` (deleted)

## Technical Details

### How Recovery Worked

1. Queried Stripe API for all paid checkout sessions between Feb 1-16, 2026
2. Extracted order details from Stripe session metadata and line items
3. Reconstructed order payloads matching the expected Google Sheet format
4. Posted orders to Google Apps Script with `create_order` action
5. Updated payment status to "paid" with `update_status` action

### Why Details Were Lost

Stripe checkout sessions store:
- Customer name and email ✅
- Line items (product names, prices, quantities) ✅
- Payment status ✅

But NOT:
- Product sizes ❌
- Jersey numbers ❌
- Flocage text ❌

These details are only in the original checkout request, not persisted in Stripe metadata. Future improvement: add these to Stripe metadata.

## Monitoring

Use the reconciliation script regularly to ensure orders are being recorded:

```bash
node --env-file=.env.local -r ts-node/register scripts/reconcile-orders.ts
```

This will list all paid Stripe sessions so you can verify they match your Google Sheet.

## Support

If you encounter issues:
1. Check Google Apps Script execution logs (View → Logs)
2. Check Vercel function logs for the checkout API
3. Run the reconciliation script to identify missing orders
4. Contact development team if manual recovery is needed

---

**Status:** ✅ Recovery Complete - Awaiting Apps Script Update
