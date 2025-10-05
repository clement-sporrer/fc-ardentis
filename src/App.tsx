import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";

import Index from "./pages/Index";
import Equipe from "./pages/Equipe";
import Calendrier from "./pages/Calendrier";
import Contacts from "./pages/Contacts";
import Rejoindre from "./pages/Rejoindre";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

// ✅ Page produit (dynamique)
import ProductPage from "./pages/shop/[slug]";

// ✅ Nouvelles pages Checkout (détails client + succès paiement)
import CheckoutDetails from "./pages/checkout/Details";
import CheckoutSuccess from "./pages/checkout/Success";
// (optionnel) Page annulation :
// import CheckoutCancel from "./pages/checkout/Cancel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-background font-sport">
            <Navigation />
            <main className="flex-1">
              <Routes>
                {/* Pages principales */}
                <Route path="/" element={<Index />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/calendrier" element={<Calendrier />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/rejoindre" element={<Rejoindre />} />

                {/* SHOP */}
                {/* ⚠️ la route dynamique doit être déclarée AVANT /shop si tu utilises des sous-routes plus spécifiques */}
                <Route path="/shop/:slug" element={<ProductPage />} />
                <Route path="/shop" element={<Shop />} />

                {/* CHECKOUT */}
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/details" element={<CheckoutDetails />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                {/* (optionnel) Annulation paiement */}
                {/* <Route path="/checkout/cancel" element={<CheckoutCancel />} /> */}

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
