# FC Ardentis — Claude Code Guide

Official website for FC Ardentis football club (Paris region).
Tech: React 18 · TypeScript · Vite · TailwindCSS · Vercel Serverless Functions.

---

## Project Overview

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript + shadcn/ui + Tailwind CSS |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Vercel Serverless Functions (`/api`) |
| Payments | Stripe |
| CMS | Google Sheets (CSV exports) |
| Hosting | Vercel |

---

## Key Commands

```bash
# Development server
npm run dev

# Build for production (sitemap + SSR + pre-render)
npm run build

# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck

# Format
npx prettier --write .
```

> **No test suite** is configured for this project.

---

## Project Structure

```
fc-ardentis/
├── api/                    # Vercel serverless functions
│   ├── checkout.ts         # Creates Stripe checkout session + order
│   └── stripe-webhook.ts   # Handles Stripe webhook events
├── docs/                   # Architecture, API, deployment docs
├── scripts/                # Build scripts (sitemap, prerender)
├── src/
│   ├── components/         # Shared React components
│   │   └── ui/             # shadcn/ui primitives
│   ├── contexts/           # React Context (CartContext)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (utils.ts, validation.ts, logger.ts)
│   ├── pages/              # Route-level page components
│   │   ├── shop/           # Product detail page
│   │   └── checkout/       # Checkout flow (Details, Success, Cancel, Failed)
│   ├── seo/                # SEO helpers and Head management
│   ├── App.tsx             # Root component + route definitions
│   └── main.tsx            # Entry point
├── public/                 # Static assets
└── vercel.json             # Vercel config (rewrites, functions)
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. Required variables:

### Frontend (Vite — `VITE_` prefix)

| Variable | Purpose |
|---|---|
| `VITE_SHEET_PRODUCTS_CSV_URL` | Google Sheets CSV — product catalog |
| `VITE_GOOGLE_SHEET_TEAM_CSV_URL` | Google Sheets CSV — team roster |
| `VITE_GOOGLE_SHEET_EVENTS_CSV_URL` | Google Sheets CSV — calendar events |
| `VITE_SHEET_STANDINGS_CSV_URL` | Google Sheets CSV — league standings |
| `VITE_MONDIAL_RELAY_BRAND` | Mondial Relay brand code (`BDTEST` for dev) |

### Backend (Vercel serverless)

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` or `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) |
| `PRODUCTS_CSV_URL` | Same products sheet, server-side copy |
| `SHEET_ORDERS_WEBAPP_URL` | Google Apps Script URL for order logging |

---

## Architecture Notes

### Data Flow
Google Sheets acts as the CMS. The frontend fetches CSV exports directly (via `VITE_*` env vars) using TanStack Query. There is no traditional database.

### Checkout Flow
1. User fills `Details` page → cart from `CartContext`
2. Frontend calls `POST /api/checkout` → Stripe `checkout.session.create`
3. User is redirected to Stripe hosted checkout
4. On success, Stripe webhook (`/api/stripe-webhook`) fires → order logged to Google Sheets

### Delivery
Two modes available at checkout:
- **Remise en main propre** — €0 (pickup at club)
- **Point Relais** — €5.99 (Mondial Relay widget for relay point selection)

Shipments are handled manually by the club; no label API is integrated.

### SEO / Pre-rendering
The build pipeline (`npm run build`) generates a sitemap, does a Vite SSR build, then pre-renders static HTML pages. SSR entry is `src/entry-server.tsx`. Pre-render script is `scripts/prerender.mjs`.

---

## Code Style

- Use **TypeScript** for all new files.
- Components live in `src/components/` (shared) or `src/pages/` (route-level).
- Prefer **named exports** for components.
- Use `cn()` from `src/lib/utils.ts` for merging Tailwind classes.
- Form validation with **Zod schemas** in `src/lib/validation.ts`.
- Logging via `src/lib/logger.ts` (never `console.log` directly).
- Keep serverless functions in `/api/` as `.ts` files; they run on `@vercel/node`.

---

## Useful Docs

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Data Sources & Google Sheets setup](docs/data-sources.md)
- [Deployment guide](docs/deployment.md)
- [Business logic & rules](docs/business-logic.md)
