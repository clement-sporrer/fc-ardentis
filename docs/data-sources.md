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
// Code.gs - FC Ardentis Premium Order Management System
// ============================================================
// Configuration - CHANGE THESE VALUES
// ============================================================
const ADMIN_EMAIL = 'your-email@example.com'; // CHANGE THIS
const APP_TOKEN = 'your-secret-token-here'; // CHANGE THIS (must match SHEET_APP_TOKEN env var)
const SITE_URL = 'https://fc-ardentis.vercel.app'; // Your website URL

// ============================================================
// Brand Colors (FC Ardentis Premium Design System)
// ============================================================
const COLORS = {
  navy: '#0f1628',        // Deep Navy
  violet: '#888ce6',      // Soft Violet
  pink: '#f4d0e4',        // Soft Pink
  magenta: '#e7c1d6',     // Magenta
  white: '#ffffff',
  lightGray: '#f8f9fa',
  darkGray: '#6c757d',
  text: '#1a1d29'
};

// ============================================================
// Main Handler - Processes incoming POST requests
// ============================================================
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

// ============================================================
// Premium Email Template Generator
// ============================================================
function getPremiumEmailTemplate(title, bodyContent, footerText) {
  const logoUrl = SITE_URL + '/assets/logo.png';
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${COLORS.lightGray};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${COLORS.lightGray};">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 16px; box-shadow: 0 10px 40px rgba(15, 22, 40, 0.1); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.navy} 0%, #1a2642 100%); padding: 40px 30px; text-align: center;">
              <img src="${logoUrl}" alt="FC Ardentis" style="height: 60px; width: auto; margin-bottom: 10px;" />
              <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${title}</h1>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${bodyContent}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.navy}; padding: 30px; text-align: center; color: ${COLORS.white};">
              <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">FC Ardentis</p>
              <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">${footerText}</p>
              <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">
                © ${new Date().getFullYear()} FC Ardentis - Tous droits réservés
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================
// Customer Order Confirmation Email (Premium Design)
// ============================================================
function sendCustomerEmail(orderData, orderId) {
  try {
    const customer = orderData.customer;
    const items = orderData.items || [];
    const delivery = orderData.delivery || {};
    
    // Build items table
    let itemsHtml = '';
    items.forEach((item, index) => {
      const details = [];
      if (item.size) details.push('Taille: ' + item.size);
      if (item.number) details.push('N°: ' + item.number);
      if (item.flocage) details.push('Flocage: ' + item.flocage);
      
      const bgColor = index % 2 === 0 ? COLORS.lightGray : COLORS.white;
      
      itemsHtml += `
        <tr style="background-color: ${bgColor};">
          <td style="padding: 16px 12px; font-size: 15px; color: ${COLORS.text}; font-weight: 500;">
            ${item.name}
          </td>
          <td style="padding: 16px 12px; font-size: 14px; color: ${COLORS.darkGray};">
            ${details.length > 0 ? details.join(' • ') : '—'}
          </td>
          <td style="padding: 16px 12px; text-align: center; font-size: 15px; color: ${COLORS.text}; font-weight: 600;">
            ${item.quantity}
          </td>
          <td style="padding: 16px 12px; text-align: right; font-size: 15px; color: ${COLORS.text}; font-weight: 600;">
            ${item.price_eur.toFixed(2)} €
          </td>
        </tr>`;
    });
    
    // Build delivery info
    let deliveryHtml = '';
    if (delivery.method === 'relay') {
      deliveryHtml = `
        <div style="background-color: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.violet}; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.darkGray}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">📦 Livraison</p>
          <p style="margin: 0 0 5px 0; font-size: 16px; color: ${COLORS.text}; font-weight: 600;">Point Relais</p>
          <p style="margin: 0; font-size: 14px; color: ${COLORS.darkGray}; line-height: 1.6;">
            ${delivery.relay_point_name}<br>
            ${delivery.relay_point_address}<br>
            ${delivery.relay_point_postcode} ${delivery.relay_point_city}
          </p>
          <p style="margin: 12px 0 0 0; font-size: 14px; color: ${COLORS.violet}; font-weight: 600;">
            Frais de livraison: ${orderData.delivery_cost_eur.toFixed(2)} €
          </p>
        </div>`;
    } else {
      deliveryHtml = `
        <div style="background-color: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.violet}; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.darkGray}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🤝 Livraison</p>
          <p style="margin: 0; font-size: 16px; color: ${COLORS.text}; font-weight: 600;">Remise en main propre</p>
        </div>`;
    }
    
    const bodyContent = `
      <p style="margin: 0 0 10px 0; font-size: 18px; color: ${COLORS.text}; font-weight: 600;">Bonjour ${customer.name},</p>
      <p style="margin: 0 0 30px 0; font-size: 15px; color: ${COLORS.darkGray}; line-height: 1.6;">
        Merci pour votre commande ! Nous avons bien reçu votre demande et nous la traiterons dès réception du paiement.
      </p>
      
      <!-- Order Summary -->
      <div style="margin: 30px 0;">
        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: ${COLORS.navy}; font-weight: 700;">📋 Récapitulatif de commande</h2>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
          <thead>
            <tr style="background-color: ${COLORS.navy};">
              <th style="padding: 14px 12px; text-align: left; font-size: 13px; color: ${COLORS.white}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Article</th>
              <th style="padding: 14px 12px; text-align: left; font-size: 13px; color: ${COLORS.white}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Détails</th>
              <th style="padding: 14px 12px; text-align: center; font-size: 13px; color: ${COLORS.white}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qté</th>
              <th style="padding: 14px 12px; text-align: right; font-size: 13px; color: ${COLORS.white}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>
      
      ${deliveryHtml}
      
      <!-- Total -->
      <div style="background: linear-gradient(135deg, ${COLORS.violet} 0%, ${COLORS.magenta} 100%); padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <p style="margin: 0 0 5px 0; font-size: 14px; color: ${COLORS.white}; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total</p>
        <p style="margin: 0; font-size: 32px; color: ${COLORS.white}; font-weight: 700;">${orderData.total_eur.toFixed(2)} €</p>
      </div>
      
      <p style="margin: 30px 0 0 0; font-size: 13px; color: ${COLORS.darkGray}; line-height: 1.6; padding: 15px; background-color: ${COLORS.lightGray}; border-radius: 8px;">
        <strong>Référence:</strong> ${orderId}
      </p>`;
    
    const subject = '✅ Commande confirmée - FC Ardentis #' + orderId.substring(0, 8);
    const htmlBody = getPremiumEmailTemplate(
      'Commande Confirmée',
      bodyContent,
      'Merci de votre confiance ! Nous traitons votre commande avec soin.'
    );
    
    MailApp.sendEmail({
      to: customer.email,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('✓ Premium customer email sent to: ' + customer.email);
  } catch (error) {
    Logger.log('✗ Error sending customer email: ' + error.toString());
  }
}

// ============================================================
// Admin Notification Email (Premium Design)
// ============================================================
function sendAdminNotification(orderData, orderId) {
  try {
    const customer = orderData.customer;
    const items = orderData.items || [];
    const delivery = orderData.delivery || {};
    
    // Build items list with highlighting
    let itemsHtml = '';
    items.forEach((item, index) => {
      const details = [];
      if (item.size) details.push('<span style="color: ' + COLORS.violet + '; font-weight: 600;">Taille: ' + item.size + '</span>');
      if (item.number) details.push('<span style="color: ' + COLORS.violet + '; font-weight: 600;">N°: ' + item.number + '</span>');
      if (item.flocage) details.push('<span style="color: ' + COLORS.magenta + '; font-weight: 600;">Flocage: ' + item.flocage + '</span>');
      
      itemsHtml += `
        <div style="padding: 15px; background-color: ${index % 2 === 0 ? COLORS.lightGray : COLORS.white}; border-radius: 8px; margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0; font-size: 16px; color: ${COLORS.text}; font-weight: 600;">
            ${item.name} <span style="background-color: ${COLORS.violet}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 13px; margin-left: 8px;">x${item.quantity}</span>
          </p>
          ${details.length > 0 ? '<p style="margin: 5px 0 0 0; font-size: 14px; color: ' + COLORS.darkGray + ';">' + details.join(' • ') + '</p>' : ''}
          <p style="margin: 5px 0 0 0; font-size: 14px; color: ${COLORS.text}; font-weight: 600;">${item.price_eur.toFixed(2)} € / unité</p>
        </div>`;
    });
    
    // Build delivery info
    let deliveryHtml = '';
    if (delivery.method === 'relay') {
      deliveryHtml = `
        <div style="background-color: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.magenta}; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: ${COLORS.darkGray}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">📦 LIVRAISON</p>
          <p style="margin: 0 0 5px 0; font-size: 16px; color: ${COLORS.text}; font-weight: 700;">Point Relais (${orderData.delivery_cost_eur.toFixed(2)} €)</p>
          <p style="margin: 0; font-size: 14px; color: ${COLORS.darkGray}; line-height: 1.6;">
            <strong>${delivery.relay_point_name}</strong><br>
            ${delivery.relay_point_address}<br>
            ${delivery.relay_point_postcode} ${delivery.relay_point_city}
          </p>
        </div>`;
    } else {
      deliveryHtml = `
        <div style="background-color: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.magenta}; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: ${COLORS.darkGray}; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">🤝 LIVRAISON</p>
          <p style="margin: 0; font-size: 16px; color: ${COLORS.text}; font-weight: 700;">Remise en main propre</p>
        </div>`;
    }
    
    const bodyContent = `
      <div style="background: linear-gradient(135deg, ${COLORS.magenta} 0%, ${COLORS.pink} 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
        <p style="margin: 0; font-size: 24px; color: ${COLORS.navy}; font-weight: 700;">🎉 Nouvelle Commande !</p>
      </div>
      
      <!-- Customer Info -->
      <div style="margin: 30px 0;">
        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: ${COLORS.navy}; font-weight: 700;">👤 Informations Client</h2>
        <div style="background-color: ${COLORS.lightGray}; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 18px; color: ${COLORS.text}; font-weight: 700;">${customer.name}</p>
          <p style="margin: 0 0 8px 0; font-size: 15px; color: ${COLORS.darkGray};">
            📧 <a href="mailto:${customer.email}" style="color: ${COLORS.violet}; text-decoration: none; font-weight: 600;">${customer.email}</a>
          </p>
          ${customer.phone ? '<p style="margin: 0; font-size: 15px; color: ' + COLORS.darkGray + ';">📱 ' + customer.phone + '</p>' : ''}
        </div>
      </div>
      
      <!-- Items -->
      <div style="margin: 30px 0;">
        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: ${COLORS.navy}; font-weight: 700;">🛍️ Articles Commandés</h2>
        ${itemsHtml}
      </div>
      
      <!-- Delivery -->
      <div style="margin: 30px 0;">
        ${deliveryHtml}
      </div>
      
      <!-- Notes -->
      ${orderData.notes ? `
      <div style="margin: 30px 0;">
        <h2 style="margin: 0 0 15px 0; font-size: 20px; color: ${COLORS.navy}; font-weight: 700;">📝 Notes</h2>
        <div style="background-color: ${COLORS.lightGray}; padding: 20px; border-radius: 8px; font-style: italic; color: ${COLORS.darkGray};">
          ${orderData.notes}
        </div>
      </div>` : ''}
      
      <!-- Total -->
      <div style="background: linear-gradient(135deg, ${COLORS.navy} 0%, #1a2642 100%); padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.white}; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Total Commande</p>
        <p style="margin: 0; font-size: 36px; color: ${COLORS.white}; font-weight: 700;">${orderData.total_eur.toFixed(2)} €</p>
      </div>
      
      <p style="margin: 30px 0 0 0; font-size: 13px; color: ${COLORS.darkGray}; padding: 15px; background-color: ${COLORS.lightGray}; border-radius: 8px; text-align: center;">
        <strong>Référence:</strong> ${orderId}
      </p>`;
    
    const subject = '🛒 Nouvelle Commande - ' + customer.name + ' (' + orderData.total_eur.toFixed(2) + ' €)';
    const htmlBody = getPremiumEmailTemplate(
      'Nouvelle Commande',
      bodyContent,
      'Traitez cette commande dès que possible pour assurer la satisfaction du client.'
    );
    
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('✓ Premium admin notification sent to: ' + ADMIN_EMAIL);
  } catch (error) {
    Logger.log('✗ Error sending admin notification: ' + error.toString());
  }
}

// ============================================================
// Payment Confirmation Email (Premium Design)
// ============================================================
function sendPaymentConfirmationEmail(orderRow, orderId) {
  try {
    const customerEmail = orderRow[3]; // Column D
    const customerName = orderRow[2]; // Column C
    const total = orderRow[6]; // Column G
    
    const bodyContent = `
      <div style="text-align: center; margin: 0 0 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px auto; position: relative;">
          <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px;">✓</span>
        </div>
      </div>
      
      <p style="margin: 0 0 10px 0; font-size: 18px; color: ${COLORS.text}; font-weight: 600;">Bonjour ${customerName},</p>
      <p style="margin: 0 0 30px 0; font-size: 15px; color: ${COLORS.darkGray}; line-height: 1.6;">
        Excellente nouvelle ! Nous avons bien reçu votre paiement et votre commande est maintenant <strong style="color: #10b981;">confirmée</strong>.
      </p>
      
      <!-- Payment Amount -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${COLORS.white}; opacity: 0.95; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Paiement Reçu</p>
        <p style="margin: 0; font-size: 36px; color: ${COLORS.white}; font-weight: 700;">${total.toFixed(2)} €</p>
      </div>
      
      <!-- Next Steps -->
      <div style="background-color: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.violet}; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <p style="margin: 0 0 15px 0; font-size: 16px; color: ${COLORS.navy}; font-weight: 700;">📦 Prochaines étapes</p>
        <ul style="margin: 0; padding-left: 20px; color: ${COLORS.darkGray}; font-size: 14px; line-height: 1.8;">
          <li>Votre commande est en cours de préparation</li>
          <li>Vous recevrez une notification dès qu'elle sera prête</li>
          <li>Pour toute question, répondez simplement à cet email</li>
        </ul>
      </div>
      
      <p style="margin: 30px 0 0 0; font-size: 15px; color: ${COLORS.darkGray}; line-height: 1.6; text-align: center;">
        Merci de votre confiance et à très bientôt ! ⚽
      </p>
      
      <p style="margin: 30px 0 0 0; font-size: 13px; color: ${COLORS.darkGray}; padding: 15px; background-color: ${COLORS.lightGray}; border-radius: 8px; text-align: center;">
        <strong>Référence:</strong> ${orderId}
      </p>`;
    
    const subject = '✅ Paiement confirmé - FC Ardentis #' + orderId.substring(0, 8);
    const htmlBody = getPremiumEmailTemplate(
      'Paiement Confirmé',
      bodyContent,
      'Votre commande est en cours de préparation.'
    );
    
    MailApp.sendEmail({
      to: customerEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    
    Logger.log('✓ Premium payment confirmation sent to: ' + customerEmail);
  } catch (error) {
    Logger.log('✗ Error sending payment confirmation: ' + error.toString());
  }
}

// ============================================================
// COMPREHENSIVE TEST SUITE
// ============================================================

// Test 1: Email Design & Layout Test
function testEmailLayout() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🎨 TEST: Premium Email Design');
  Logger.log('═══════════════════════════════════════════');
  
  const testOrderData = {
    customer: {
      name: 'Jean Dupont',
      email: ADMIN_EMAIL, // Send to yourself for testing
      phone: '+33 6 12 34 56 78'
    },
    items: [
      {
        name: 'Maillot Domicile 24/25',
        quantity: 1,
        price_eur: 55.99,
        size: 'L',
        number: '10',
        flocage: 'DUPONT'
      },
      {
        name: 'Short Domicile 24/25',
        quantity: 1,
        price_eur: 32.99,
        size: 'L',
        number: '',
        flocage: ''
      }
    ],
    delivery: {
      method: 'relay',
      relay_point_id: 'FR-123456',
      relay_point_name: 'Relay Test Point',
      relay_point_address: '123 Rue de Test',
      relay_point_postcode: '75001',
      relay_point_city: 'Paris'
    },
    delivery_cost_eur: 5.99,
    total_eur: 94.97,
    notes: 'Ceci est une commande de test pour vérifier le design des emails.'
  };
  
  const testOrderId = 'TEST-' + Utilities.getUuid().substring(0, 8);
  
  Logger.log('📧 Sending test emails to: ' + ADMIN_EMAIL);
  Logger.log('📦 Test Order ID: ' + testOrderId);
  Logger.log('');
  
  try {
    sendCustomerEmail(testOrderData, testOrderId);
    Logger.log('✅ Customer confirmation email sent');
  } catch (e) {
    Logger.log('❌ Customer email failed: ' + e.toString());
  }
  
  try {
    sendAdminNotification(testOrderData, testOrderId);
    Logger.log('✅ Admin notification email sent');
  } catch (e) {
    Logger.log('❌ Admin notification failed: ' + e.toString());
  }
  
  Logger.log('');
  Logger.log('✨ Test complete! Check your inbox at: ' + ADMIN_EMAIL);
  Logger.log('═══════════════════════════════════════════');
}

// Test 2: Order Creation Flow Test
function testCreateOrder() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🧪 TEST: Order Creation Flow');
  Logger.log('═══════════════════════════════════════════');
  
  const mockRequest = {
    postData: {
      contents: JSON.stringify({
        token: APP_TOKEN,
        action: 'create_order',
        data: {
          customer: {
            name: 'Test User',
            email: ADMIN_EMAIL,
            phone: '+33612345678',
            address: ''
          },
          notes: '[TEST] Order creation flow test',
          items: [
            {
              name: 'Test Product',
              quantity: 1,
              price_eur: 19.99,
              size: 'M',
              number: '7',
              flocage: 'TEST'
            }
          ],
          delivery: {
            method: 'hand',
            relay_point_id: '',
            relay_point_name: '',
            relay_point_address: '',
            relay_point_postcode: '',
            relay_point_city: '',
            relay_point_country: ''
          },
          delivery_cost_eur: 0,
          total_eur: 19.99,
          created_at: new Date().toISOString(),
          order_id: 'TEST-CREATE-' + Utilities.getUuid().substring(0, 8)
        }
      })
    }
  };
  
  try {
    const response = doPost(mockRequest);
    const result = JSON.parse(response.getContent());
    
    if (result.order_id) {
      Logger.log('✅ Order created successfully');
      Logger.log('📦 Order ID: ' + result.order_id);
      Logger.log('✉️ Emails should have been sent');
      Logger.log('📊 Check the Orders sheet for the new entry');
    } else {
      Logger.log('❌ Order creation failed: ' + JSON.stringify(result));
    }
  } catch (e) {
    Logger.log('❌ Test failed: ' + e.toString());
  }
  
  Logger.log('═══════════════════════════════════════════');
}

// Test 3: Payment Status Update Test
function testUpdateStatus() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🧪 TEST: Payment Status Update');
  Logger.log('═══════════════════════════════════════════');
  
  // First, get the most recent test order
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  let testOrderId = null;
  for (let i = data.length - 1; i > 0; i--) {
    const orderId = data[i][0];
    if (orderId && orderId.toString().startsWith('TEST-')) {
      testOrderId = orderId;
      break;
    }
  }
  
  if (!testOrderId) {
    Logger.log('⚠️ No test order found. Run testCreateOrder() first.');
    Logger.log('═══════════════════════════════════════════');
    return;
  }
  
  Logger.log('📦 Using Order ID: ' + testOrderId);
  
  const mockRequest = {
    postData: {
      contents: JSON.stringify({
        token: APP_TOKEN,
        action: 'update_status',
        data: {
          order_id: testOrderId,
          payment_status: 'paid',
          stripe_session_id: 'pi_test_' + Utilities.getUuid().substring(0, 16)
        }
      })
    }
  };
  
  try {
    const response = doPost(mockRequest);
    const result = JSON.parse(response.getContent());
    
    if (result.success) {
      Logger.log('✅ Status updated successfully');
      Logger.log('✉️ Payment confirmation email should have been sent');
      Logger.log('📊 Check the Orders sheet - status should be "paid"');
    } else {
      Logger.log('❌ Status update failed: ' + JSON.stringify(result));
    }
  } catch (e) {
    Logger.log('❌ Test failed: ' + e.toString());
  }
  
  Logger.log('═══════════════════════════════════════════');
}

// Test 4: Payment Confirmation Email Test
function testPaymentEmail() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🧪 TEST: Payment Confirmation Email');
  Logger.log('═══════════════════════════════════════════');
  
  // Mock order row data (as it appears in the sheet)
  const mockOrderRow = [
    'TEST-PAY-' + Utilities.getUuid().substring(0, 8), // order_id
    new Date().toISOString(), // created_at
    'Marie Martin', // customer_name
    ADMIN_EMAIL, // customer_email
    '+33612345678', // customer_phone
    JSON.stringify([{name: 'Test Product', quantity: 1, price_eur: 45.00}]), // items
    45.00, // total_eur
    'pending', // payment_status
    '', // stripe_session_id
    'hand', // delivery_method
    0, // delivery_cost_eur
  ];
  
  const testOrderId = mockOrderRow[0];
  
  Logger.log('📧 Sending payment confirmation to: ' + ADMIN_EMAIL);
  Logger.log('📦 Order ID: ' + testOrderId);
  
  try {
    sendPaymentConfirmationEmail(mockOrderRow, testOrderId);
    Logger.log('✅ Payment confirmation email sent');
    Logger.log('✨ Check your inbox at: ' + ADMIN_EMAIL);
  } catch (e) {
    Logger.log('❌ Test failed: ' + e.toString());
  }
  
  Logger.log('═══════════════════════════════════════════');
}

// Test 5: Complete End-to-End Flow Test
function testCompleteFlow() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🚀 FULL END-TO-END TEST');
  Logger.log('═══════════════════════════════════════════');
  Logger.log('This will simulate a complete order flow:');
  Logger.log('1. Create order → 2. Update to paid → 3. Verify emails');
  Logger.log('');
  
  // Step 1: Create Order
  Logger.log('Step 1/2: Creating test order...');
  testCreateOrder();
  
  // Wait a bit
  Utilities.sleep(2000);
  
  // Step 2: Update Status
  Logger.log('');
  Logger.log('Step 2/2: Updating payment status...');
  testUpdateStatus();
  
  Logger.log('');
  Logger.log('✨ Complete flow test finished!');
  Logger.log('📧 You should have received 3 emails:');
  Logger.log('   1. Customer order confirmation');
  Logger.log('   2. Admin new order notification');
  Logger.log('   3. Customer payment confirmation');
  Logger.log('═══════════════════════════════════════════');
}

// Test 6: Cleanup Test Orders
function cleanupTestOrders() {
  Logger.log('═══════════════════════════════════════════');
  Logger.log('🧹 CLEANUP: Removing Test Orders');
  Logger.log('═══════════════════════════════════════════');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  let deletedCount = 0;
  
  // Iterate backwards to avoid index shifting issues
  for (let i = data.length - 1; i > 0; i--) {
    const orderId = data[i][0];
    if (orderId && orderId.toString().startsWith('TEST-')) {
      sheet.deleteRow(i + 1);
      deletedCount++;
      Logger.log('🗑️ Deleted: ' + orderId);
    }
  }
  
  Logger.log('');
  Logger.log('✅ Cleanup complete! Removed ' + deletedCount + ' test order(s)');
  Logger.log('═══════════════════════════════════════════');
}
```

**Premium Features:**
- ✨ **Ultra-Premium Email Design:** Matches FC Ardentis brand colors (Deep Navy, Soft Violet)
- 🎨 **Responsive Layout:** Looks perfect on desktop and mobile
- 📧 **Three Email Types:** Customer confirmation, payment success, admin alerts
- 🧪 **Comprehensive Testing:** 6 test functions to verify everything works
- 🔒 **Security:** Token-based authentication prevents unauthorized access
- 🚫 **Duplicate Prevention:** Checks for existing order IDs
- 📊 **Beautiful Tables:** Clean, professional product listings
- 🎯 **Action-Oriented:** Admin emails highlight key information

**Security Notes:**
- The `APP_TOKEN` prevents unauthorized access to your Apps Script endpoint
- Make sure to keep this token secret and match it with your `SHEET_APP_TOKEN` environment variable
- The script validates the token on every request

### 3. Test Suite (Comprehensive Testing - HIGHLY Recommended)

The Apps Script includes a comprehensive test suite to verify all functionality before going live. Run these tests in order:

#### Quick Test: Email Design Only
```
Function: testEmailLayout()
```
- Sends sample emails with the premium design
- Tests both customer and admin email templates
- No data is added to the sheet
- **Run this first** to verify emails look good

#### Full Integration Tests

1. **Test Order Creation**
   ```
   Function: testCreateOrder()
   ```
   - Creates a test order in the sheet
   - Sends customer confirmation + admin notification
   - Verifies the complete order creation flow

2. **Test Payment Update**
   ```
   Function: testUpdateStatus()
   ```
   - Updates the most recent test order to "paid"
   - Sends payment confirmation email
   - Must run `testCreateOrder()` first

3. **Test Payment Email Only**
   ```
   Function: testPaymentEmail()
   ```
   - Sends a standalone payment confirmation
   - No sheet modifications

4. **Complete End-to-End Test**
   ```
   Function: testCompleteFlow()
   ```
   - Runs the full order lifecycle
   - Creates order → Updates to paid
   - Sends all 3 email types
   - **Best for final verification**

5. **Cleanup Test Data**
   ```
   Function: cleanupTestOrders()
   ```
   - Removes all test orders from the sheet
   - Run after testing is complete

#### How to Run Tests

1. In the Apps Script editor, select a test function from the dropdown menu
2. Click the "Run" button (▶️)
3. Authorize the script if prompted (first run only)
4. Check the execution log (View → Logs or Ctrl+Enter)
5. Check your email inbox at `ADMIN_EMAIL`

#### Expected Results

✅ **Success indicators:**
- Logs show "✅" checkmarks
- Emails arrive in your inbox with premium design
- Test orders appear in the Orders sheet (for integration tests)

❌ **If tests fail:**
- Check that `ADMIN_EMAIL` and `APP_TOKEN` are configured
- Verify email permissions are granted
- Review error messages in the logs

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

