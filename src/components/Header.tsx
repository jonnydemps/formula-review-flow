
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home,
  User,
  LogIn,
  Menu,
  X,
  TestTube,
  FileUp,
  Shield
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    return user.role === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard';
  };

  const getDashboardIcon = () => {
    if (!user) return <FileUp className="h-4 w-4" />;
    return user.role === 'admin' ? <Shield className="h-4 w-4" /> : <FileUp className="h-4 w-4" />;
  };

  console.log("Header rendering, user:", user?.email, "role:", user?.role);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-md shadow-sm'}`}>
      <div className="ra-container flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 text-ra-blue font-medium text-2xl group">
            <TestTube className="h-10 w-10 transform group-hover:rotate-12 transition-transform duration-300" />
            <span className="bg-gradient-to-r from-ra-blue to-blue-600 bg-clip-text text-transparent">SimplyRA</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-ra-blue transition-colors relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ra-blue transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          <Link to="/about-us" className="text-gray-600 hover:text-ra-blue transition-colors relative group">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ra-blue transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          {user ? (
            <>
              <Link 
                to={getDashboardLink()}
                className="text-gray-600 hover:text-ra-blue transition-colors relative group"
              >
                {getDashboardLabel()}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ra-blue transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                  {user.name || user.email} ({user.role})
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()} 
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild size="sm" className="hover:bg-blue-50 transition-colors">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="bg-gradient-to-r from-ra-blue to-blue-600 hover:from-blue-600 hover:to-ra-blue transition-all duration-300">
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 focus:outline-none rounded-md hover:bg-gray-100 transition-colors" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="text-gray-700" /> : <Menu className="text-gray-700" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute w-full shadow-lg animate-fade-in border-t">
          <nav className="ra-container flex flex-col gap-4 py-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              <Home className="h-4 w-4 text-ra-blue" />
              Home
            </Link>
            
            <Link 
              to="/about-us" 
              className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
              onClick={closeMenu}
            >
              <User className="h-4 w-4 text-ra-blue" />
              About Us
            </Link>
            
            {user ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  {getDashboardIcon()}
                  {getDashboardLabel()}
                </Link>
                <div className="border-t my-2" />
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm text-gray-500 flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                    <User className="h-4 w-4" />
                    {user.name || user.email}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => { signOut(); closeMenu(); }} 
                    size="sm"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/sign-in" 
                  className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  <LogIn className="h-4 w-4 text-ra-blue" />
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="p-3 bg-gradient-to-r from-ra-blue to-blue-600 text-white rounded-md text-center flex justify-center items-center gap-2"
                  onClick={closeMenu}
                >
                  <User className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
