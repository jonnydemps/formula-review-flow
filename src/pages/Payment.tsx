
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { DollarSign, CreditCard } from 'lucide-react';

const Payment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extract parameters from URL query string
  const queryParams = new URLSearchParams(location.search);
  const formulaId = queryParams.get('formulaId');
  const amount = queryParams.get('amount');
  const formulaName = queryParams.get('name');
  
  // Protect route
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (!formulaId || !amount) {
      navigate('/customer-dashboard');
      toast.error('Invalid payment details');
    }
  }, [user, navigate, formulaId, amount]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call to Stripe API
      // through a secure backend endpoint
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Payment successful!');
      
      // Redirect back to dashboard
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || !formulaId || !amount) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md p-4">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Secure payment for formula review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 mb-1">Formula</div>
                  <div className="font-medium">{formulaName || 'Cosmetic Formula'}</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 mb-1">Amount</div>
                  <div className="text-2xl font-bold text-ra-blue flex items-center">
                    <DollarSign className="h-5 w-5" />
                    {amount}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="text-sm font-medium mb-2">Payment Method</div>
                  <div className="bg-white border rounded-md p-3 flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <span>Credit Card (Visa/Mastercard)</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    You'll be redirected to our secure payment processor
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handlePayment} 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
                <DollarSign className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
