
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, TestTube, Loader2 } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { useRouteChange } from '@/hooks/useRouteChange';
import DesktopNavigation from '@/components/header/DesktopNavigation';
import MobileMenu from '@/components/header/MobileMenu';

const Header: React.FC = () => {
  const { user, signOut, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isScrolled = useScrolled(10);

  // Close menu when route changes
  useRouteChange(() => setIsMenuOpen(false));

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  console.log("Header rendering, user:", user?.email, "role:", user?.role);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background shadow-md' : 'bg-background/90 backdrop-blur-md shadow-sm'}`}
      role="banner"
    >
      <div className="container flex justify-between items-center py-3 md:py-4">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-2 md:gap-3 text-primary font-medium text-2xl md:text-4xl group focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md"
            aria-label="SimplyRA - Home"
          >
            <TestTube className="h-12 w-12 md:h-20 md:w-20 transform group-hover:rotate-12 transition-transform duration-300" />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              SimplyRA
            </span>
          </Link>
        </div>
        
        {isLoading ? (
          <div 
            className="flex items-center gap-2 text-muted-foreground"
            role="status"
            aria-label="Loading user information"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm hidden sm:block">Loading...</span>
          </div>
        ) : (
          <DesktopNavigation 
            user={user} 
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
          />
        )}
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md hover:bg-muted transition-colors" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          disabled={isLoading}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <Menu className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>
      
      <MobileMenu 
        user={user}
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />
    </header>
  );
};

export default Header;
