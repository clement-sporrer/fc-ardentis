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

// ✅ nouvelle importation de la page produit
import ProductPage from "./pages/shop/[slug]";

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
                <Route path="/" element={<Index />} />
                <Route path="/equipe" element={<Equipe />} />
                <Route path="/calendrier" element={<Calendrier />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/rejoindre" element={<Rejoindre />} />

                {/* SHOP PAGES */}
                <Route path="/shop" element={<Shop />} />
                {/* ✅ nouvelle route dynamique pour la page produit */}
                <Route path="/shop/:slug" element={<ProductPage />} />

                <Route path="/checkout" element={<Checkout />} />

                {/* CATCH-ALL */}
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
