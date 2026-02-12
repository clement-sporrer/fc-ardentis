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

```javascript
// Code.gs
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'create_order') {
    const d = data.data;
    const delivery = d.delivery || {};
    const orderId = Utilities.getUuid();
    sheet.appendRow([
      orderId,
      d.created_at,
      d.customer.name,
      d.customer.email,
      d.customer.phone,
      JSON.stringify(d.items),
      d.total_eur,
      'pending',
      '',
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
    return ContentService.createTextOutput(JSON.stringify({ order_id: orderId }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'update_status') {
    const orders = sheet.getDataRange().getValues();
    for (let i = 1; i < orders.length; i++) {
      if (orders[i][0] === data.data.order_id) {
        sheet.getRange(i + 1, 8).setValue(data.data.payment_status);
        sheet.getRange(i + 1, 9).setValue(data.data.stripe_session_id);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3. Deploy

1. Click Deploy → New Deployment
2. Select type: Web app
3. Execute as: Me
4. Who has access: Anyone
5. Click Deploy
6. Copy the Web app URL

### 4. Environment Variable

```env
SHEET_ORDERS_WEBAPP_URL=https://script.google.com/macros/s/.../exec
```

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

1. Check execution logs in Apps Script editor
2. Verify JSON structure matches expected format
3. Ensure sheet names are correct

### Data Not Parsing

1. Check delimiter (comma vs semicolon)
2. Verify column order matches schema
3. Check for BOM characters (UTF-8 with BOM)

