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
  ArrowRight 
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  // Decide where to direct the user based on their authentication status and role
  const getStartedLink = user 
    ? user.role === 'specialist' 
      ? '/specialist-dashboard' 
      : '/customer-dashboard'
    : '/sign-up';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white to-blue-50 py-16">
          <div className="ra-container text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cosmetic Formula Review for Australia & New Zealand
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Professional regulatory affairs specialists ensuring your cosmetic formulas 
              comply with Australia and New Zealand regulations
            </p>
            <Button size="lg" asChild>
              <Link to={getStartedLink}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="ra-container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 card-transition">
                <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                  <FileUp className="h-8 w-8 text-ra-blue" />
                </div>
                <h3 className="text-xl font-medium mb-2">1. Upload Formula</h3>
                <p className="text-gray-500">
                  Submit your cosmetic formula Excel file securely through our platform
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 card-transition" style={{ animationDelay: '0.2s' }}>
                <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                  <FlaskConical className="h-8 w-8 text-ra-blue" />
                </div>
                <h3 className="text-xl font-medium mb-2">2. Expert Review</h3>
                <p className="text-gray-500">
                  Our specialists review your formula against Australia and New Zealand regulations
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 card-transition" style={{ animationDelay: '0.4s' }}>
                <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
                  <FileCheck className="h-8 w-8 text-ra-blue" />
                </div>
                <h3 className="text-xl font-medium mb-2">3. Get Results</h3>
                <p className="text-gray-500">
                  Receive detailed compliance report with ingredient analysis
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="ra-container">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4 text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Expert Analysis</h3>
                  <p className="text-gray-600">
                    Get your formulas reviewed by specialists with years of experience in 
                    cosmetic regulatory affairs for Australia and New Zealand markets
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4 text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Detailed Reports</h3>
                  <p className="text-gray-600">
                    Receive comprehensive reports with ingredient-level analysis, identifying 
                    any compliance issues and recommendations
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4 text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Quick Turnaround</h3>
                  <p className="text-gray-600">
                    Fast review process with clear communication on timelines and pricing
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex items-start">
                <div className="mr-4 text-ra-green">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Secure Platform</h3>
                  <p className="text-gray-600">
                    Your formula data is encrypted and securely stored with strict 
                    access controls protecting your intellectual property
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-ra-blue text-white">
          <div className="ra-container text-center">
            <div className="inline-block bg-white/10 p-3 rounded-full mb-6">
              <TestTube className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-6">
              Ready to ensure your cosmetic formulas comply with regulations?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Sign up today and get your formulas reviewed by expert regulatory affairs specialists
            </p>
            <Button variant="secondary" size="lg" asChild>
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
