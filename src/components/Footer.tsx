
import React from 'react';
import { Link } from 'react-router-dom';
import { TestTube } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="ra-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Tagline */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 text-ra-blue font-medium text-xl mb-2">
              <TestTube className="h-5 w-5" />
              <span>SimplyRA</span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Professional cosmetic formula reviews for Australia & New Zealand regulatory compliance.
            </p>
          </div>
          
          {/* Navigation Links */}
          <div>
            <h3 className="font-medium mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-ra-blue transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="text-gray-600 hover:text-ra-blue transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className="text-gray-600 hover:text-ra-blue transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-medium mb-3">Contact Us</h3>
            <address className="not-italic text-sm text-gray-500">
              <p>Email: contact@simplyra.com</p>
              <p>Phone: +61 2 1234 5678</p>
              <p>Sydney, Australia</p>
            </address>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© {currentYear} SimplyRA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
