# Data Sources

> FC Ardentis - Google Sheets Integration Guide

## Table of Contents

- [Overview](#overview)
- [Google Sheets Setup](#google-sheets-setup)
- [Sheet Schemas](#sheet-schemas)
  - [Products Sheet](#products-sheet)
  - [Team Sheet](#team-sheet)
  - [Events Sheet](#events-sheet)
  - [Standings Sheet](#standings-sheet)
  - [Orders Sheet](#orders-sheet)
- [Publishing as CSV](#publishing-as-csv)
- [Apps Script Setup](#apps-script-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

FC Ardentis uses Google Sheets as a lightweight CMS for managing:

- **Products** - Shop items (jerseys, shorts)
- **Team** - Player roster and stats
- **Events** - Matches and training sessions
- **Standings** - League table
- **Orders** - Customer orders (via Apps Script)

This approach allows non-technical team members to update content without code changes.

---

## Google Sheets Setup

### 1. Create a New Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "FC Ardentis Data"
4. Create separate sheets (tabs) for each data type

### 2. Share Settings

For CSV publishing to work:

1. Click "Share" button
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"

---

## Sheet Schemas

### Products Sheet

Sheet name: `Products`

| Column | Name | Type | Required | Description |
|--------|------|------|----------|-------------|
| A | id | string | Yes | Unique product ID (lowercase, no spaces) |
| B | name | string | Yes | Display name |
| C | type | string | Yes | `maillot` or `short` |
| D | price_eur | number | Yes | Price in euros (e.g., `55.99`) |
| E–N | image1 … image10 | URL | image1: Yes; others: No | Product images (up to 10, no minimum) |
| O | size_guide_url | URL | No | Size chart image |
| P | active | boolean | Yes | `TRUE` or `FALSE` |
| Q | soldout | boolean | Yes | `TRUE` or `FALSE` |

**Example:**

| id | name | type | price_eur | image1 | … | image10 | size_guide_url | active | soldout |
|----|------|------|-----------|--------|---|---------|----------------|--------|---------|
| maillot-domicile | Maillot Domicile 24/25 | maillot | 55.00 | https://... | … | | https://... | TRUE | FALSE |
| short-domicile | Short Domicile 24/25 | short | 35.00 | https://... | … | | | TRUE | FALSE |

---

### Team Sheet

Sheet name: `Team`

| Column | Name | Type | Required | Description |
|--------|------|------|----------|-------------|
| A | numero | number | No | Jersey number |
| B | prenom | string | Yes | First name |
| C | nom | string | Yes | Last name |
| D | poste | string | Yes | Position (see below) |
| E | photo_url | URL | No | Player photo |
| F | origine | string | No | Country/origin |
| G | fun_fact | string | No | Fun fact about player |
| H | joueur_prefere | string | No | Favorite player |
| I | matchs_joues | number | No | Matches played |
| J | buts | number | No | Goals scored |
| K | passes_decisives | number | No | Assists |

**Position Values:**

- `Goalkeeper` → Gardien de but
- `Defender` → Défenseur
- `Midfielder` → Milieu de terrain
- `Forward` → Attaquant

---

### Events Sheet

Sheet name: `Events`

| Column | Name | Type | Required | Description |
|--------|------|------|----------|-------------|
| A | date | string | Yes | `DD/MM/YYYY` format |
| B | title | string | No | Event title |
| C | start_time | string | No | `HH:MM` format |
| D | end_time | string | No | `HH:MM` format |
| E | location | string | No | Venue name |
| F | type | string | Yes | `match` or `entrainement` |
| G | team_home | string | No | Home team name |
| H | team_away | string | No | Away team name |
| I | score_home | number | No | Home team score |
| J | score_away | number | No | Away team score |
| K | resultat | string | No | `V`, `N`, or `D` (or `win`/`draw`/`loose`) |
| L | home_logo | URL | No | Home team logo |
| M | away_logo | URL | No | Away team logo |

---

### Standings Sheet

Sheet name: `Standings`

| Column | Name | Type | Required | Description |
|--------|------|------|----------|-------------|
| A | rank | number | Yes | League position |
| B | team | string | Yes | Team name |
| C | played | number | Yes | Matches played |
| D | won | number | Yes | Wins |
| E | draw | number | Yes | Draws |
| F | lost | number | Yes | Losses |
| G | goals_for | number | Yes | Goals scored |
| H | goals_against | number | Yes | Goals conceded |
| I | points | number | Yes | Total points |
| J | team_logo_url | URL | No | Team logo |

---

### Orders Sheet

Sheet name: `Orders` (managed by Apps Script)

| Column | Name | Description |
|--------|------|-------------|
| A | order_id | Unique order ID |
| B | created_at | ISO timestamp |
| C | customer_name | Full name |
| D | customer_email | Email address |
| E | customer_phone | Phone number |
| F | items | JSON array of items |
| G | total_eur | Order total (includes delivery if Point Relais) |
| H | payment_status | `pending` or `paid` |
| I | stripe_session_id | Stripe payment reference |
| J | delivery_method | `hand` or `relay` |
| K | delivery_cost_eur | 0 or 5.99 |
| L | <relay_point_id> | Mondial Relay point ID (e.g. FR-066974) |
| M | relay_point_name | Point name |
| N | relay_point_address | Full address line |
| O | relay_point_postcode | Postcode |
| P | relay_point_city | City |
| Q | relay_point_country | Country code |
| R | notes | Customer notes |

---

## Publishing as CSV

### Get Public CSV URL

1. Open your Google Sheet
2. Go to File → Share → Publish to web
3. Select the specific sheet (e.g., "Products")
4. Choose "Comma-separated values (.csv)"
5. Click "Publish"
6. Copy the generated URL

**URL Format:**

```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet={SHEET_NAME}
```

### Environment Variables

Add the URLs to your environment:

```env
VITE_SHEET_PRODUCTS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Products
VITE_GOOGLE_SHEET_TEAM_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Team
VITE_GOOGLE_SHEET_EVENTS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Events
VITE_SHEET_STANDINGS_CSV_URL=https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out:csv&sheet=Standings
```

---

## Apps Script Setup

For order management, you need a Google Apps Script web app.

### 1. Create Apps Script

1. In Google Sheets, go to Extensions → Apps Script
2. Replace the default code with the order handler
3. Deploy as Web App

### 2. Web App Configuration

Ensure the Orders sheet has a header row with columns A–R (order_id through notes). The API sends `data.delivery`, `data.delivery_cost_eur`, and `data.total_eur` (subtotal + delivery).

**Important:** Configure the following at the top of your script:
- `ADMIN_EMAIL`: Your email address to receive order notifications
- `APP_TOKEN`: A secret token to prevent unauthorized access (must match `SHEET_APP_TOKEN` in your environment variables)

```javascript
// Code.gs
const ADMIN_EMAIL = 'your-email@example.com'; // CHANGE THIS
const APP_TOKEN = 'your-secret-token-here'; // CHANGE THIS (must match SHEET_APP_TOKEN env var)

function doPost(e) {
  try {
    // Check if postData exists (it won't during test runs in the editor)
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        error: 'Invalid request',
        message: 'No POST data received. This endpoint must be called via HTTP POST with JSON body.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    const data = JSON.parse(e.postData.contents);
    
    // Verify token
    if (!data.token || data.token !== APP_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'create_order') {
      const d = data.data;
      const delivery = d.delivery || {};
      
      // Use provided order_id or generate new one
      const orderId = d.order_id || Utilities.getUuid();
      
      // Check for duplicate order_id to prevent double-inserts
      const orders = sheet.getDataRange().getValues();
      for (let i = 1; i < orders.length; i++) {
        if (orders[i][0] === orderId) {
          Logger.log('Duplicate order_id detected: ' + orderId);
          return ContentService.createTextOutput(JSON.stringify({ 
            order_id: orderId,
            warning: 'Order already exists'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      // Insert order
      sheet.appendRow([
        orderId,
        d.created_at,
        d.customer.name,
        d.customer.email,
        d.customer.phone,
        JSON.stringify(d.items),
        d.total_eur,
        d.payment_status || 'pending',
        d.stripe_session_id || '',
        delivery.method || 'hand',
        d.delivery_cost_eur != null ? d.delivery_cost_eur : 0,
        delivery.relay_point_id || '',
        delivery.relay_point_name || '',
        delivery.relay_point_address || '',
        delivery.relay_point_postcode || '',
        delivery.relay_point_city || '',
        delivery.relay_point_country || '',
        d.notes || ''
      ]);
      
      // Send confirmation email to customer
      sendCustomerEmail(d, orderId);
      
      // Send notification to admin
      sendAdminNotification(d, orderId);
      
      return ContentService.createTextOutput(JSON.stringify({ order_id: orderId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'update_status') {
      const orders = sheet.getDataRange().getValues();
      for (let i = 1; i < orders.length; i++) {
        if (orders[i][0] === data.data.order_id) {
          const oldStatus = orders[i][7]; // Column H (payment_status)
          sheet.getRange(i + 1, 8).setValue(data.data.payment_status);
          sheet.getRange(i + 1, 9).setValue(data.data.stripe_session_id);
          
          // Send payment confirmation email if status changed to paid
          if (oldStatus !== 'paid' && data.data.payment_status === 'paid') {
            sendPaymentConfirmationEmail(orders[i], data.data.order_id);
          }
          
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      error: 'Internal error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendCustomerEmail(orderData, orderId) {
  try {
    const customer = orderData.customer;
    const items = orderData.items || [];
    const delivery = orderData.delivery || {};
    
    let itemsHtml = '';
    items.forEach(item => {
      const details = [];
      if (item.size) details.push('Taille: ' + item.size);
      if (item.number) details.push('N°: ' + item.number);
      if (item.flocage) details.push('Flocage: ' + item.flocage);
      
      itemsHtml += '<tr>' +
        '<td style="padding: 8px; border-bottom: 1px solid #ddd;">' + item.name + '</td>' +
        '<td style="padding: 8px; border-bottom: 1px solid #ddd;">' + (details.join(', ') || '-') + '</td>' +
        '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">' + item.quantity + '</td>' +
        '<td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">' + item.price_eur.toFixed(2) + ' €</td>' +
        '</tr>';
    });
    
    let deliveryInfo = '';
    if (delivery.method === 'relay') {
      deliveryInfo = '<p><strong>Livraison:</strong> Point Relais (' + orderData.delivery_cost_eur.toFixed(2) + ' €)<br>' +
        delivery.relay_point_name + '<br>' +
        delivery.relay_point_address + '<br>' +
        delivery.relay_point_postcode + ' ' + delivery.relay_point_city + '</p>';
    } else {
      deliveryInfo = '<p><strong>Livraison:</strong> Remise en main propre</p>';
    }
    
    const subject = 'FC Ardentis - Confirmation de commande #' + orderId.substring(0, 8);
    const htmlBody = 
      '<html><body style="font-family: Arial, sans-serif; color: #333;">' +
      '<h2 style="color: #c41e3a;">Merci pour votre commande !</h2>' +
      '<p>Bonjour ' + customer.name + ',</p>' +
      '<p>Nous avons bien reçu votre commande. Voici le récapitulatif :</p>' +
      '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">' +
      '<thead><tr style="background-color: #f5f5f5;">' +
      '<th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Article</th>' +
      '<th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Détails</th>' +
      '<th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qté</th>' +
      '<th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Prix</th>' +
      '</tr></thead>' +
      '<tbody>' + itemsHtml + '</tbody>' +
      '</table>' +
      deliveryInfo +
      '<p><strong>Total:</strong> ' + orderData.total_eur.toFixed(2) + ' €</p>' +
      '<p>Votre commande sera traitée dès réception du paiement.</p>' +
      '<p style="margin-top: 30px;">À bientôt,<br><strong>L\'équipe FC Ardentis</strong></p>' +
      '<hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">' +
      '<p style="font-size: 12px; color: #999;">Référence: ' + orderId + '</p>' +
      '</body></html>';
    
    MailApp.sendEmail({
      to: customer.email,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('Customer email sent to: ' + customer.email);
  } catch (error) {
    Logger.log('Error sending customer email: ' + error.toString());
  }
}

function sendAdminNotification(orderData, orderId) {
  try {
    const customer = orderData.customer;
    const items = orderData.items || [];
    const delivery = orderData.delivery || {};
    
    let itemsList = items.map(item => {
      const details = [];
      if (item.size) details.push('Taille: ' + item.size);
      if (item.number) details.push('N°: ' + item.number);
      if (item.flocage) details.push('Flocage: ' + item.flocage);
      return '- ' + item.name + ' (x' + item.quantity + ') ' + (details.length ? '[' + details.join(', ') + ']' : '');
    }).join('\n');
    
    let deliveryInfo = delivery.method === 'relay' 
      ? 'Point Relais: ' + delivery.relay_point_name + ', ' + delivery.relay_point_city
      : 'Remise en main propre';
    
    const subject = '🛒 Nouvelle commande FC Ardentis - ' + customer.name;
    const body = 
      'Nouvelle commande reçue !\n\n' +
      'Client: ' + customer.name + '\n' +
      'Email: ' + customer.email + '\n' +
      'Téléphone: ' + (customer.phone || 'Non fourni') + '\n\n' +
      'Articles:\n' + itemsList + '\n\n' +
      'Livraison: ' + deliveryInfo + '\n' +
      'Total: ' + orderData.total_eur.toFixed(2) + ' €\n\n' +
      'Notes: ' + (orderData.notes || 'Aucune') + '\n\n' +
      'Référence: ' + orderId;
    
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: subject,
      body: body
    });
    
    Logger.log('Admin notification sent to: ' + ADMIN_EMAIL);
  } catch (error) {
    Logger.log('Error sending admin notification: ' + error.toString());
  }
}

function sendPaymentConfirmationEmail(orderRow, orderId) {
  try {
    const customerEmail = orderRow[3]; // Column D
    const customerName = orderRow[2]; // Column C
    const total = orderRow[6]; // Column G
    
    const subject = 'FC Ardentis - Paiement confirmé #' + orderId.substring(0, 8);
    const htmlBody = 
      '<html><body style="font-family: Arial, sans-serif; color: #333;">' +
      '<h2 style="color: #c41e3a;">Paiement confirmé !</h2>' +
      '<p>Bonjour ' + customerName + ',</p>' +
      '<p>Nous avons bien reçu votre paiement de <strong>' + total.toFixed(2) + ' €</strong>.</p>' +
      '<p>Votre commande est en cours de préparation et vous sera livrée prochainement.</p>' +
      '<p style="margin-top: 30px;">À bientôt,<br><strong>L\'équipe FC Ardentis</strong></p>' +
      '<hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">' +
      '<p style="font-size: 12px; color: #999;">Référence: ' + orderId + '</p>' +
      '</body></html>';
    
    MailApp.sendEmail({
      to: customerEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('Payment confirmation sent to: ' + customerEmail);
  } catch (error) {
    Logger.log('Error sending payment confirmation: ' + error.toString());
  }
}

// Test function - Run this from the Apps Script editor to test email functionality
function testEmailFunctionality() {
  const testOrderData = {
    customer: {
      name: 'Test Customer',
      email: ADMIN_EMAIL, // Send to yourself for testing
      phone: '+33612345678'
    },
    items: [
      {
        name: 'Maillot Test',
        quantity: 1,
        price_eur: 55.99,
        size: 'L',
        number: '10',
        flocage: 'TEST'
      }
    ],
    delivery: {
      method: 'hand'
    },
    delivery_cost_eur: 0,
    total_eur: 55.99,
    notes: 'Ceci est un test'
  };
  
  const testOrderId = 'test-' + Utilities.getUuid().substring(0, 8);
  
  Logger.log('Sending test emails...');
  Logger.log('Test Order ID: ' + testOrderId);
  
  try {
    sendCustomerEmail(testOrderData, testOrderId);
    Logger.log('✓ Customer email sent successfully');
  } catch (e) {
    Logger.log('✗ Customer email failed: ' + e.toString());
  }
  
  try {
    sendAdminNotification(testOrderData, testOrderId);
    Logger.log('✓ Admin notification sent successfully');
  } catch (e) {
    Logger.log('✗ Admin notification failed: ' + e.toString());
  }
  
  Logger.log('Test complete! Check your inbox at: ' + ADMIN_EMAIL);
}
```

**Security Notes:**
- The `APP_TOKEN` prevents unauthorized access to your Apps Script endpoint
- Make sure to keep this token secret and match it with your `SHEET_APP_TOKEN` environment variable
- The script validates the token on every request

### 3. Test Email Functionality (Optional but Recommended)

Before deploying, test that emails work correctly:

1. In the Apps Script editor, select the function `testEmailFunctionality` from the dropdown
2. Click the "Run" button (▶️)
3. Authorize the script if prompted
4. Check the execution log (View → Logs)
5. Check your email inbox (at `ADMIN_EMAIL`) for test emails

If emails arrive successfully, you're ready to deploy!

### 4. Deploy

1. Click Deploy → New Deployment
2. Select type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Click Deploy
6. Copy the Web app URL

### 5. Environment Variables

```env
SHEET_ORDERS_WEBAPP_URL=https://script.google.com/macros/s/.../exec
SHEET_APP_TOKEN=your-secret-token-here
```

**Important:** The `SHEET_APP_TOKEN` must match the `APP_TOKEN` constant in your Apps Script code.

---

## Troubleshooting

### CSV Not Updating

- Check that the sheet is still published
- Clear browser cache
- The app adds `_ts` parameter to bust cache

### CORS Errors

Google Sheets CSV exports have CORS enabled by default. If issues occur:

1. Ensure sheet is public
2. Check the URL format
3. Try accessing directly in browser

### Apps Script Errors

1. Check execution logs in Apps Script editor (View → Logs)
2. Verify JSON structure matches expected format
3. Ensure sheet names are correct
4. Verify `APP_TOKEN` matches between Apps Script and environment variables
5. Check that `ADMIN_EMAIL` is configured correctly

**Common Error:** `Cannot read properties of undefined (reading 'postData')`
- This occurs when testing the script directly in the Apps Script editor
- The `doPost` function requires an HTTP POST request with data
- Use the `testEmailFunctionality()` function instead for testing in the editor
- The script will work correctly when called from your website/API

### Emails Not Sending

1. Verify that `ADMIN_EMAIL` is set in the Apps Script code
2. Check Apps Script execution logs for email errors
3. Ensure the Google account running the script has permission to send emails
4. Check spam folders for both customer and admin emails
5. Verify customer email addresses are valid

### Data Not Parsing

1. Check delimiter (comma vs semicolon)
2. Verify column order matches schema
3. Check for BOM characters (UTF-8 with BOM)

### Order Recovery

If orders are missing from the sheet but payments were successful in Stripe:

1. Use the reconciliation script: `node --env-file=.env.local -r ts-node/register scripts/reconcile-orders.ts`
2. This will list all paid Stripe sessions
3. Contact the development team for manual recovery if needed

