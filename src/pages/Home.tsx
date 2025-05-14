
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Beaker, ArrowRight, FileCheck, Shield, Settings } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-white to-blue-50 py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-ra-blue to-blue-600 bg-clip-text text-transparent">
              Regulatory Affairs Made Simple
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Upload your formulations, get expert review, and receive compliant documentation for your products quickly and efficiently.
            </p>
            {user ? (
              <Button size="lg" asChild className="bg-ra-blue hover:bg-blue-700 rounded-full px-8 py-6">
                <Link to={user.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard'}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" asChild className="bg-ra-blue hover:bg-blue-700 rounded-full px-8">
                  <Link to="/sign-up">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 border-blue-200 hover:bg-blue-50">
                  <Link to="/sign-in">
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Feature Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How SimplyRA Works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Beaker className="text-ra-blue h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Your Formula</h3>
                <p className="text-gray-600">
                  Simply upload your formula document. We support various file formats to make submission easy.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="text-ra-blue h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expert Review</h3>
                <p className="text-gray-600">
                  Our regulatory experts will review your formula for compliance with relevant regulations.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <FileCheck className="text-ra-blue h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Receive Documentation</h3>
                <p className="text-gray-600">
                  Get comprehensive documentation and compliance reports within days, not weeks.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-ra-blue to-blue-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to simplify your regulatory compliance?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join hundreds of companies that trust SimplyRA for their regulatory needs.
            </p>
            {!user && (
              <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
                <Link to="/sign-up">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
