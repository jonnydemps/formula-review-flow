import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  CheckCircle, 
  FileUp, 
  FlaskConical,
  TestTube, 
  FileCheck,
  ArrowRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  // Safely access user with optional chaining
  const { user } = useAuth();

  // Decide where to direct the user based on their authentication status and role
  const getStartedLink = user 
    ? user.role === 'admin'
      ? '/admin-dashboard' 
      : '/customer-dashboard'
    : '/sign-up';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with enhanced gradient */}
        <section className="bg-gradient-to-br from-white via-blue-50 to-sky-100 py-20">
          <div className="ra-container text-center">
            <div className="inline-block bg-white/70 p-3 rounded-full mb-6 animate-bounce">
              <TestTube className="h-8 w-8 text-ra-blue" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
              Cosmetic Formula Review for{' '}
              <span className="bg-gradient-to-r from-ra-blue to-blue-600 bg-clip-text text-transparent">
                Australia & New Zealand
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Professional regulatory affairs specialists ensuring your cosmetic formulas 
              comply with Australia and New Zealand regulations
            </p>
            <Button size="lg" className="animate-pulse shadow-lg bg-gradient-to-r from-ra-blue to-blue-600 hover:from-blue-600 hover:to-ra-blue transition-all duration-300" asChild>
              <Link to={getStartedLink}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Features Banner */}
        <section className="bg-white py-6 border-y border-gray-100">
          <div className="ra-container">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-ra-green" />
                <span className="text-sm font-medium">Regulatory Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-ra-orange" />
                <span className="text-sm font-medium">Fast Turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-ra-blue" />
                <span className="text-sm font-medium">Expert Analysis</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section with enhanced cards */}
        <section className="py-20 bg-white">
          <div className="ra-container">
            <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our streamlined process makes it easy to get your cosmetic formulas reviewed and approved
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-8 bg-white rounded-lg shadow-lg border border-gray-100 h-full transform group-hover:-translate-y-1 transition-transform card-transition">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6 text-ra-blue">
                    <FileUp className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">1. Upload Formula</h3>
                  <p className="text-gray-500">
                    Submit your cosmetic formula Excel file securely through our platform. 
                    Your data is encrypted and protected.
                  </p>
                </div>
              </div>
              
              <div className="relative group" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-8 bg-white rounded-lg shadow-lg border border-gray-100 h-full transform group-hover:-translate-y-1 transition-transform card-transition">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6 text-ra-blue">
                    <FlaskConical className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">2. Expert Review</h3>
                  <p className="text-gray-500">
                    Our specialists review your formula against Australia and New Zealand regulations
                    with detailed ingredient analysis.
                  </p>
                </div>
              </div>
              
              <div className="relative group" style={{ animationDelay: '0.4s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-8 bg-white rounded-lg shadow-lg border border-gray-100 h-full transform group-hover:-translate-y-1 transition-transform card-transition">
                  <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6 text-ra-blue">
                    <FileCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-3">3. Get Results</h3>
                  <p className="text-gray-500">
                    Receive detailed compliance report with ingredient analysis and 
                    recommendations for market readiness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section with enhanced design */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="ra-container">
            <h2 className="text-3xl font-bold text-center mb-4">Benefits</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Why choose our regulatory affairs services for your cosmetic formulas
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm flex items-start hover:shadow-md transition-shadow">
                <div className="mr-5 p-3 bg-green-50 rounded-full text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Expert Analysis</h3>
                  <p className="text-gray-600">
                    Get your formulas reviewed by specialists with years of experience in 
                    cosmetic regulatory affairs for Australia and New Zealand markets.
                    Our team stays updated with the latest regulatory changes.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm flex items-start hover:shadow-md transition-shadow">
                <div className="mr-5 p-3 bg-green-50 rounded-full text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Detailed Reports</h3>
                  <p className="text-gray-600">
                    Receive comprehensive reports with ingredient-level analysis, identifying 
                    any compliance issues and providing clear recommendations for making
                    your products market-ready.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm flex items-start hover:shadow-md transition-shadow">
                <div className="mr-5 p-3 bg-green-50 rounded-full text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Quick Turnaround</h3>
                  <p className="text-gray-600">
                    Fast review process with clear communication on timelines and pricing.
                    We understand that time-to-market is critical for your business and
                    work efficiently to deliver results.
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-sm flex items-start hover:shadow-md transition-shadow">
                <div className="mr-5 p-3 bg-green-50 rounded-full text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Secure Platform</h3>
                  <p className="text-gray-600">
                    Your formula data is encrypted and securely stored with strict 
                    access controls protecting your intellectual property. We take
                    data security and confidentiality seriously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section with enhanced design */}
        <section className="py-20 bg-gradient-to-br from-ra-blue via-blue-600 to-blue-700 text-white">
          <div className="ra-container text-center">
            <div className="inline-block bg-white/20 p-4 rounded-full mb-8 shadow-lg">
              <TestTube className="h-10 w-10" />
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Ready to ensure your cosmetic formulas comply with regulations?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Sign up today and get your formulas reviewed by expert regulatory affairs specialists
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="shadow-xl hover:shadow-2xl transition-all hover:scale-105" 
              asChild
            >
              <Link to={getStartedLink}>
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
