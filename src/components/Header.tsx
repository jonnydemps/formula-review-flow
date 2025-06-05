
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-md shadow-sm'}`}>
      <div className="ra-container flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 text-ra-blue font-medium text-4xl group">
            <TestTube className="h-20 w-20 transform group-hover:rotate-12 transition-transform duration-300" />
            <span className="bg-gradient-to-r from-ra-blue to-blue-600 bg-clip-text text-transparent">SimplyRA</span>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading...</span>
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
          className="md:hidden p-2 focus:outline-none rounded-md hover:bg-gray-100 transition-colors" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          disabled={isLoading}
        >
          {isMenuOpen ? <X className="text-gray-700" /> : <Menu className="text-gray-700" />}
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
