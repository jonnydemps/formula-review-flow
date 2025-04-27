
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationState {
  formulaId: string;
  amount: number;
}

const Payment: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const state = location.state as LocationState;
  
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
      return;
    }
    
    if (!state?.formulaId || !state?.amount) {
      toast.error("Missing payment information");
      navigate('/customer-dashboard');
    }
  }, [user, navigate, state]);

  const handlePayment = async () => {
    if (!state?.formulaId) {
      toast.error("Missing formula information");
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would integrate with a payment provider here
      // For now, we'll just simulate a successful payment
      setTimeout(async () => {
        try {
          const { error } = await supabase
            .from('formulas')
            .update({ status: 'paid' })
            .eq('id', state.formulaId);

          if (error) throw error;
          
          toast.success('Payment successful!');
          navigate('/customer-dashboard');
        } catch (error: any) {
          toast.error(`Payment processing failed: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }, 2000); // Simulate payment processing delay
    } catch (error: any) {
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete payment for your formula review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Formula Review Service</span>
                <span>${state.amount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>${state.amount}</span>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Payment Method</h3>
              <p className="text-sm text-gray-500 mb-4">
                In a production app, a credit card form would be integrated here.
                For demo purposes, payment will be processed automatically.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${state.amount}`}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Payment;
