import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Eager load - critical path pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load - secondary pages
const Equipe = lazy(() => import("./pages/Equipe"));
const Calendrier = lazy(() => import("./pages/Calendrier"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Rejoindre = lazy(() => import("./pages/Rejoindre"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductPage = lazy(() => import("./pages/shop/[slug]"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutDetails = lazy(() => import("./pages/checkout/Details"));
const CheckoutSuccess = lazy(() => import("./pages/checkout/Success"));
const CheckoutCancel = lazy(() => import("./pages/checkout/Cancel"));
const CheckoutFailed = lazy(() => import("./pages/checkout/Failed"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Page loading fallback
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col bg-background font-sport">
              <Navigation />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Main pages */}
                    <Route path="/" element={<Index />} />
                    <Route path="/equipe" element={<Equipe />} />
                    <Route path="/calendrier" element={<Calendrier />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/rejoindre" element={<Rejoindre />} />

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
                </Suspense>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
        <Analytics />
      </CartProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
