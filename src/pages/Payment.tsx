
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createCheckoutSession } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationState {
  formulaId: string;
  amount: number;
}

const Payment: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = location.state as LocationState;
  
  useEffect(() => {
    if (!user) {
      navigate('/sign-in', { replace: true });
      return;
    }
    
    if (!state?.formulaId || !state?.amount) {
      toast.error("Missing payment information");
      navigate('/customer-dashboard', { replace: true });
    }
  }, [user, navigate, state]);

  const handlePayment = async () => {
    if (!state?.formulaId) {
      toast.error("Missing formula information");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Initiating payment for formula: ${state.formulaId}, amount: $${state.amount}`);
      
      // Create Stripe checkout session
      const session = await createCheckoutSession(state.formulaId, state.amount);
      
      if (session && session.url) {
        console.log(`Redirecting to Stripe checkout: ${session.url}`);
        // Use direct window.location change for most reliable redirect
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setError(error.message || 'Failed to initialize payment');
      toast.error(`Payment initialization failed: ${error.message}`);
      setLoading(false);
    }
  };

  if (!user || !state?.formulaId || !state?.amount) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-none bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-2xl font-bold text-gray-800">Complete Your Payment</CardTitle>
            <CardDescription className="text-gray-600">
              Review your formula review payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-gray-100 rounded-md shadow-inner">
              <div className="flex justify-between mb-2">
                <span>Formula Review Service</span>
                <span className="font-medium">${state.amount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-ra-blue">${state.amount}</span>
              </div>
            </div>

            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="text-sm text-gray-500 mb-2">
                Secure payment processing by Stripe
              </p>
              <div className="flex gap-2 items-center">
                <svg className="h-5 w-auto" viewBox="0 0 60 25" focusable="false" role="img">
                  <title>Visa</title>
                  <path d="M42.3 4H35.3L30.5 17.2L28.7 6.9C28.3 5.3 27.3 4.1 25.6 4H15.7L15.6 4.8C17.4 5.2 19.2 5.9 20.8 6.8L25.4 21H32.4L42.3 4ZM17.5 21H24.2L17.1 9.9L17.5 21ZM55.3 21H60L55.6 4H49.9C48.3 4 47.2 4.8 46.7 6.2L40.8 21H47.8L48.7 18.1H54.4L55.3 21ZM50.4 13.5L52.4 7.3L53.6 13.5H50.4ZM11 12.9L15.1 5.4C14.3 5.1 13.4 4.9 12.5 4.9H6.6L0.4 12.9H11Z" 
                  fill="#172B85"/>
                </svg>
                <svg className="h-5 w-auto" viewBox="0 0 60 38" focusable="false" role="img">
                  <title>MasterCard</title>
                  <path d="M55.5 8.2H45.1V26.1H55.5V8.2Z" fill="#FF5F00"/>
                  <path d="M46.2 17.1C46.2 13.6 47.8 10.4 50.3 8.2C48.3 6.5 45.7 5.5 42.8 5.5C36.5 5.5 31.4 10.7 31.4 17.1C31.4 23.5 36.5 28.7 42.8 28.7C45.7 28.7 48.3 27.7 50.3 26C47.8 23.9 46.2 20.7 46.2 17.1Z" fill="#EB001B"/>
                  <path d="M69.5 17.1C69.5 23.5 64.4 28.7 58.1 28.7C55.2 28.7 52.6 27.7 50.6 26C53.2 23.8 54.7 20.7 54.7 17.1C54.7 13.6 53.1 10.4 50.6 8.2C52.6 6.5 55.2 5.5 58.1 5.5C64.4 5.5 69.5 10.8 69.5 17.1Z" fill="#F79E1B"/>
                </svg>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-ra-blue hover:bg-ra-blue-dark transition-all shadow-md hover:shadow-lg"
              onClick={handlePayment}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${state.amount}`
              )}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Payment;
