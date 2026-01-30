import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Routes: SSR/prerender uses eager imports (no Suspense). Client uses lazy imports (code-splitting).
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

type PageComponent = React.ComponentType<any>;

let EquipeSSR: PageComponent | null = null;
let CalendrierSSR: PageComponent | null = null;
let ContactsSSR: PageComponent | null = null;
let RejoindreSSR: PageComponent | null = null;
let ShopSSR: PageComponent | null = null;
let ProductPageSSR: PageComponent | null = null;
let CheckoutSSR: PageComponent | null = null;
let CheckoutDetailsSSR: PageComponent | null = null;
let CheckoutSuccessSSR: PageComponent | null = null;
let CheckoutCancelSSR: PageComponent | null = null;
let CheckoutFailedSSR: PageComponent | null = null;
let CFLSSR: PageComponent | null = null;
let VideosSSR: PageComponent | null = null;

// SSR-only eager loading (tree-shaken from client build).
if (import.meta.env.SSR) {
  EquipeSSR = (await import("./pages/Equipe")).default;
  CalendrierSSR = (await import("./pages/Calendrier")).default;
  ContactsSSR = (await import("./pages/Contacts")).default;
  RejoindreSSR = (await import("./pages/Rejoindre")).default;
  ShopSSR = (await import("./pages/Shop")).default;
  ProductPageSSR = (await import("./pages/shop/[slug]")).default;
  CheckoutSSR = (await import("./pages/Checkout")).default;
  CheckoutDetailsSSR = (await import("./pages/checkout/Details")).default;
  CheckoutSuccessSSR = (await import("./pages/checkout/Success")).default;
  CheckoutCancelSSR = (await import("./pages/checkout/Cancel")).default;
  CheckoutFailedSSR = (await import("./pages/checkout/Failed")).default;
  CFLSSR = (await import("./pages/CFL")).default;
  VideosSSR = (await import("./pages/Videos")).default;
}

const EquipeCSR = lazy(() => import("./pages/Equipe"));
const CalendrierCSR = lazy(() => import("./pages/Calendrier"));
const ContactsCSR = lazy(() => import("./pages/Contacts"));
const RejoindreCSR = lazy(() => import("./pages/Rejoindre"));
const ShopCSR = lazy(() => import("./pages/Shop"));
const ProductPageCSR = lazy(() => import("./pages/shop/[slug]"));
const CheckoutCSR = lazy(() => import("./pages/Checkout"));
const CheckoutDetailsCSR = lazy(() => import("./pages/checkout/Details"));
const CheckoutSuccessCSR = lazy(() => import("./pages/checkout/Success"));
const CheckoutCancelCSR = lazy(() => import("./pages/checkout/Cancel"));
const CheckoutFailedCSR = lazy(() => import("./pages/checkout/Failed"));
const CFLCSR = lazy(() => import("./pages/CFL"));
const VideosCSR = lazy(() => import("./pages/Videos"));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4 text-muted-foreground font-sport text-sm">Chargement...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  if (import.meta.env.SSR) {
    // These are guaranteed to be loaded in SSR mode (see top-level if above).
    const Equipe = EquipeSSR!;
    const Calendrier = CalendrierSSR!;
    const Contacts = ContactsSSR!;
    const Rejoindre = RejoindreSSR!;
    const Shop = ShopSSR!;
    const ProductPage = ProductPageSSR!;
    const Checkout = CheckoutSSR!;
    const CheckoutDetails = CheckoutDetailsSSR!;
    const CheckoutSuccess = CheckoutSuccessSSR!;
    const CheckoutCancel = CheckoutCancelSSR!;
    const CheckoutFailed = CheckoutFailedSSR!;
    const CFL = CFLSSR!;
    const Videos = VideosSSR!;

    return (
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<Index />} />
        <Route path="/equipe" element={<Equipe />} />
        <Route path="/calendrier" element={<Calendrier />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/rejoindre" element={<Rejoindre />} />
        <Route path="/cfl" element={<CFL />} />

        {/* Shop */}
        <Route path="/shop/:slug" element={<ProductPage />} />
        <Route path="/shop" element={<Shop />} />

        {/* Checkout */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/details" element={<CheckoutDetails />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/checkout/failed" element={<CheckoutFailed />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<Index />} />
        <Route path="/equipe" element={<EquipeCSR />} />
        <Route path="/calendrier" element={<CalendrierCSR />} />
        <Route path="/videos" element={<VideosCSR />} />
        <Route path="/contacts" element={<ContactsCSR />} />
        <Route path="/rejoindre" element={<RejoindreCSR />} />
        <Route path="/cfl" element={<CFLCSR />} />

        {/* Shop */}
        <Route path="/shop/:slug" element={<ProductPageCSR />} />
        <Route path="/shop" element={<ShopCSR />} />

        {/* Checkout */}
        <Route path="/checkout" element={<CheckoutCSR />} />
        <Route path="/checkout/details" element={<CheckoutDetailsCSR />} />
        <Route path="/checkout/success" element={<CheckoutSuccessCSR />} />
        <Route path="/checkout/cancel" element={<CheckoutCancelCSR />} />
        <Route path="/checkout/failed" element={<CheckoutFailedCSR />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-background font-sport">
              <Navigation />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        <Analytics />
      </CartProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
