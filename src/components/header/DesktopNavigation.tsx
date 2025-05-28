
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { getDashboardLink, getDashboardLabel } from '@/utils/headerUtils';

interface DesktopNavigationProps {
  user: User | null;
  onSignOut: () => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ user, onSignOut }) => {
  return (
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
            to={getDashboardLink(user.role)}
            className="text-gray-600 hover:text-ra-blue transition-colors relative group"
          >
            {getDashboardLabel(user.role)}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-ra-blue transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
              {user.name || user.email} ({user.role})
            </span>
            <Button 
              variant="outline" 
              onClick={() => onSignOut()} 
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
  );
};

export default DesktopNavigation;
