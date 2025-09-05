import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Accueil' },
    { path: '/equipe', label: 'Notre équipe' },
    { path: '/calendrier', label: 'Calendrier' },
    { path: '/contacts', label: 'Contacts' },
    { path: '/rejoindre', label: 'Nous rejoindre' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-secondary/95 backdrop-blur-sm border-b border-border/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/ad48e0e9-aa8d-4228-8e16-a621364627d3.png" 
              alt="FC Ardentis Logo"
              className="h-10 w-auto"
            />
            <span className="font-sport-condensed font-bold text-xl text-secondary-foreground">
              FC ARDENTIS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md font-sport font-medium transition-sport ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-secondary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-md font-sport font-medium transition-sport ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-secondary-foreground hover:bg-secondary-hover hover:text-secondary-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;