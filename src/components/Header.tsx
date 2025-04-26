import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home,
  User,
  LogIn,
  Menu,
  X,
  TestTube,
  FileUp
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="ra-container flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 text-ra-blue font-medium text-xl">
            <TestTube className="h-6 w-6" />
            <span>SimplyRA</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-ra-blue transition-colors">
            Home
          </Link>
          
          {user ? (
            <>
              <Link 
                to={user.role === 'specialist' ? '/specialist-dashboard' : '/customer-dashboard'}
                className="text-gray-600 hover:text-ra-blue transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {user.name || user.email}
                </span>
                <Button variant="outline" onClick={signOut} size="sm">
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild size="sm">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute w-full shadow-md animate-fade-in">
          <nav className="ra-container flex flex-col gap-4 py-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
              onClick={closeMenu}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to={user.role === 'specialist' ? '/specialist-dashboard' : '/customer-dashboard'} 
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
                  onClick={closeMenu}
                >
                  <FileUp className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="border-t my-2" />
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.name || user.email}
                  </span>
                  <Button variant="outline" onClick={() => { signOut(); closeMenu(); }} size="sm">
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/sign-in" 
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
                  onClick={closeMenu}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="p-2 bg-ra-blue text-white rounded-md text-center"
                  onClick={closeMenu}
                >
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
