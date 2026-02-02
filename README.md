# FC Ardentis

<div align="center">
  <img src="public/assets/logo.png" alt="FC Ardentis Logo" width="120" />
  <br />
  <strong>Official website for FC Ardentis football club</strong>
  <br />
  <em>Paris Region • Founded 2025</em>
  <br /><br />
  
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://fc-ardentis.vercel.app)
  [![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
  [![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)](LICENSE)
</div>

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/clement-sporrer/fc-ardentis.git
cd fc-ardentis

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev) | UI Library |
| [TypeScript](https://www.typescriptlang.org) | Type Safety |
| [Vite](https://vitejs.dev) | Build Tool |
| [TailwindCSS](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) | UI Components |
| [React Router](https://reactrouter.com) | Routing |
| [React Query](https://tanstack.com/query) | Data Fetching |

### Backend

| Technology | Purpose |
|------------|---------|
| [Vercel Functions](https://vercel.com/docs/functions) | Serverless API |
| [Stripe](https://stripe.com) | Payment Processing |
| [Google Sheets](https://sheets.google.com) | Content Management |

### Infrastructure

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Hosting & Deployment |
| [Vercel Analytics](https://vercel.com/analytics) | Usage Analytics |

---

## Project Structure

```
fc-ardentis/
├── api/                    # Vercel serverless functions
│   ├── checkout.ts         # Order & Stripe session creation
│   └── stripe-webhook.ts   # Stripe event handler
├── docs/                   # Documentation
│   ├── architecture.md     # System architecture
│   ├── api.md             # API reference
│   ├── data-sources.md    # Google Sheets setup
│   ├── deployment.md      # Deployment guide
│   └── business-logic.md  # Business rules
├── public/                 # Static assets
│   ├── assets/            # Images & logos
│   └── favicon.ico        # Site favicon
├── src/
│   ├── components/        # React components
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/          # React Context providers
│   │   └── CartContext.tsx # Shopping cart state
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   └── utils.ts       # Shared utilities
│   ├── pages/             # Page components
│   │   ├── Index.tsx      # Home page
│   │   ├── Equipe.tsx     # Team page
│   │   ├── Calendrier.tsx # Calendar page
│   │   ├── Shop.tsx       # Shop listing
│   │   ├── shop/          # Shop subpages
│   │   └── checkout/      # Checkout flow
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel configuration
└── vite.config.ts         # Vite configuration
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

### Required for Development

```env
# Google Sheets (CSV exports)
VITE_SHEET_PRODUCTS_CSV_URL=       # Products catalog
VITE_GOOGLE_SHEET_TEAM_CSV_URL=    # Team roster
VITE_GOOGLE_SHEET_EVENTS_CSV_URL=  # Calendar events
VITE_SHEET_STANDINGS_CSV_URL=      # League standings
```

### Required for Checkout

```env
# Stripe
STRIPE_SECRET_KEY=                  # sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=              # whsec_...

# Google Sheets (server-side)
PRODUCTS_CSV_URL=                   # Products catalog (same as VITE_)
SHEET_ORDERS_WEBAPP_URL=            # Apps Script Web App URL
```

### Optional – Livraison Point Relais

```env
# Mondial Relay widget (choix du point relais par le client)
VITE_MONDIAL_RELAY_BRAND=BDTEST     # Code test ; remplacer en production
```

See [docs/deployment.md](docs/deployment.md) for complete variable reference.

---

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run typecheck

# Format code (Prettier)
npx prettier --write .
```

### Testing Stripe Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5173/api/stripe-webhook
```

---

## Deployment

The project is configured for automatic deployment on Vercel.

### Automatic Deployments

- **Production**: Push to `main` branch
- **Preview**: Create pull request

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

See [docs/deployment.md](docs/deployment.md) for detailed deployment guide.

---

## Livraison

Deux modes de livraison sont proposés au checkout :

- **Remise en main propre** – 0 € (retrait au club)
- **Point Relais** – 5,99 € (Points Relais® / Lockers Mondial Relay ou Inpost)

Le client choisit son mode de livraison sur la page « Finaliser la commande ». S’il choisit Point Relais, un widget Mondial Relay s’affiche pour sélectionner un point par code postal. Les envois sont gérés manuellement par le club (pas d’intégration étiquettes Mondial Relay). Voir [docs/data-sources.md](docs/data-sources.md) pour les colonnes livraison dans la feuille Orders.

---

## Documentation

Comprehensive documentation is available in the `/docs` folder:

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System architecture & diagrams |
| [API Reference](docs/api.md) | Backend API documentation |
| [Data Sources](docs/data-sources.md) | Google Sheets setup guide |
| [Deployment](docs/deployment.md) | Vercel deployment guide |
| [Business Logic](docs/business-logic.md) | Business rules & workflows |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

### Quick Guidelines

1. Create feature branch from `main`
2. Follow existing code style
3. Write meaningful commit messages
4. Test your changes locally
5. Submit pull request

---

## License

All rights reserved. FC Ardentis © 2025

---

<div align="center">
  <br />
  <strong>FC Ardentis</strong>
  <br />
  <em>Since 2025</em>
  <br /><br />
  Created with passion by <a href="https://linkedin.com/in/clementsporrer">Clément Sporrer</a>
</div>
