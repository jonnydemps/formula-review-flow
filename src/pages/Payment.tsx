
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { processPayment } from '@/services/paymentService';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const Payment: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const formulaId = searchParams.get('formula');
  const amount = Number(searchParams.get('amount') || 0);

  useEffect(() => {
    // Redirect if no formula ID or amount
    if (!formulaId || !amount) {
      navigate('/customer-dashboard');
    }

    // Redirect if not authenticated
    if (!user) {
      navigate('/sign-in');
    }
  }, [formulaId, amount, user, navigate]);

  const handlePayment = async () => {
    if (!formulaId || !amount) return;
    
    setIsProcessing(true);
    
    try {
      // Process payment
      await processPayment(formulaId, amount);
      
      // Show success UI
      setIsComplete(true);
      toast.success('Payment successful!');
      
      // Redirect back to dashboard after delay
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!formulaId || !amount || !user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 flex items-center justify-center">
        <div className="container max-w-md px-4 py-16">
          {!isComplete ? (
            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>
                  Secure payment for formula review
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Formula Review:</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Payment form would go here in a real app */}
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500 text-center">
                    This is a demo payment page. No actual payment will be processed.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Payment Successful!</CardTitle>
                <CardDescription>
                  Your formula review is now in progress
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p>
                  Thank you for your payment of ${amount.toFixed(2)}. Our specialists will 
                  now review your formula and prepare a comprehensive report.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate('/customer-dashboard')}>
                  Return to Dashboard
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
