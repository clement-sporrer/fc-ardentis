import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import CartDrawer from './CartDrawer';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Accueil', path: '/' },
    { name: 'Notre équipe', path: '/equipe' },
    { name: 'Calendrier', path: '/calendrier' },
    { name: 'Boutique', path: '/shop' },
    { name: 'Contacts', path: '/contacts' },
    { name: 'Nous rejoindre', path: '/rejoindre' }
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo et nom du club */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-sport">
            <img 
              src="/assets/logo.png"
              alt="FC Ardentis Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="font-sport-condensed font-bold text-xl text-foreground">
              FC ARDENTIS
            </span>
          </Link>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-sport font-medium transition-sport ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <CartDrawer />
          </div>

          {/* Actions mobiles et desktop */}
          <div className="flex items-center space-x-2">
            <div className="md:hidden">
              <CartDrawer />
            </div>
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border/20 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-lg font-sport font-medium transition-sport ${
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;