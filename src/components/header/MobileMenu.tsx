
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { 
  Home,
  User as UserIcon,
  LogIn,
  FileUp,
  Shield
} from 'lucide-react';
import { getDashboardLink, getDashboardLabel } from '@/utils/headerUtils';

interface MobileMenuProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ user, isOpen, onClose, onSignOut }) => {
  const getDashboardIcon = () => {
    if (!user) return <FileUp className="h-4 w-4" />;
    return user.role === 'admin' ? <Shield className="h-4 w-4" /> : <FileUp className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white absolute w-full shadow-lg animate-fade-in border-t">
      <nav className="ra-container flex flex-col gap-4 py-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
          onClick={onClose}
        >
          <Home className="h-4 w-4 text-ra-blue" />
          Home
        </Link>
        
        <Link 
          to="/about-us" 
          className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
          onClick={onClose}
        >
          <UserIcon className="h-4 w-4 text-ra-blue" />
          About Us
        </Link>
        
        {user ? (
          <>
            <Link 
              to={getDashboardLink(user.role)} 
              className="flex items-center gap-2 p-3 hover:bg-blue-50 rounded-md transition-colors"
              onClick={onClose}
            >
              {getDashboardIcon()}
              {getDashboardLabel(user.role)}
            </Link>
            <div className="border-t my-2" />
            <div className="flex items-center justify-between p-3">
              <span className="text-sm text-gray-500 flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <UserIcon className="h-4 w-4" />
                {user.name || user.email}
              </span>
              <Button 
                variant="outline" 
                onClick={() => { onSignOut(); onClose(); }} 
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
              onClick={onClose}
            >
              <LogIn className="h-4 w-4 text-ra-blue" />
              Sign In
            </Link>
            <Link 
              to="/sign-up" 
              className="p-3 bg-gradient-to-r from-ra-blue to-blue-600 text-white rounded-md text-center flex justify-center items-center gap-2"
              onClick={onClose}
            >
              <UserIcon className="h-4 w-4" />
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
