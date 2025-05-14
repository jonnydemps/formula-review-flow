
import React from 'react';
import { Link } from 'react-router-dom';
import { TestTube, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="ra-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Tagline */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 text-ra-blue font-medium text-xl mb-4 group">
              <TestTube className="h-5 w-5 transform group-hover:rotate-12 transition-transform duration-300" />
              <span className="bg-gradient-to-r from-ra-blue to-blue-600 bg-clip-text text-transparent">SimplyRA</span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Professional cosmetic formula reviews for Australia & New Zealand regulatory compliance.
              We help you navigate the complex regulatory landscape with confidence.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-ra-blue hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-ra-blue hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-ra-blue hover:text-white transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </a>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div>
            <h3 className="font-medium text-lg mb-4 pb-2 border-b">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-ra-blue transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-ra-blue rounded-full"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-gray-600 hover:text-ra-blue transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-ra-blue rounded-full"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="text-gray-600 hover:text-ra-blue transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-ra-blue rounded-full"></span>
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className="text-gray-600 hover:text-ra-blue transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-ra-blue rounded-full"></span>
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-ra-blue transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-ra-blue rounded-full"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 hover:text-ra-blue transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-ra-blue rounded-full"></span>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-medium text-lg mb-4 pb-2 border-b">Contact Us</h3>
            <address className="not-italic text-sm space-y-3">
              <p className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-ra-blue mt-1" />
                <span className="text-gray-600">contact@simplyra.com</span>
              </p>
              <p className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-ra-blue mt-1" />
                <span className="text-gray-600">+61 432 167 096</span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-ra-blue mt-1" />
                <span className="text-gray-600">
                  7 Sterling Circuit<br />
                  Camperdown, NSW 2050<br />
                  Australia
                </span>
              </p>
            </address>
          </div>
        </div>
        
        <div className="border-t mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500 flex justify-center items-center gap-1">
            © {currentYear} SimplyRA. All rights reserved. Made with <Heart className="h-3 w-3 text-red-500 inline" /> in Australia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
