
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { handlePaymentSuccess } from '@/services/paymentService';
import { useQueryClient } from '@tanstack/react-query';

const PaymentSuccess: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formulaId } = useParams<{ formulaId: string }>();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!user) {
      navigate('/sign-in', { replace: true });
      return;
    }
    
    if (!formulaId) {
      toast.error('Missing formula information');
      navigate('/customer-dashboard', { replace: true });
      return;
    }
    
    console.log('Payment success page loaded, processing formula:', formulaId);
    
    // Process the successful payment
    handlePaymentSuccess(formulaId)
      .then(() => {
        console.log('Payment successfully processed on backend');
        toast.success('Payment processed successfully!');
        // Refresh the formulas list in the background
        queryClient.invalidateQueries({ queryKey: ['formulas', user.id] });
      })
      .catch(error => {
        console.error('Error processing payment:', error);
        toast.error(`Error confirming payment: ${error.message}`);
      });
  }, [formulaId, navigate, queryClient, user]);
  
  if (!user || !formulaId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 flex items-center justify-center bg-gray-50">
          <Loader2 className="h-10 w-10 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="border-b pb-3 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-2" />
            <CardTitle className="text-2xl font-bold text-gray-800">Payment Successful!</CardTitle>
            <CardDescription className="text-gray-600">
              Your formula review is now being processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-4 text-center">
            <p>Thank you for your payment. Our team will begin working on your formula review right away.</p>
            <p className="text-sm text-gray-500">You will receive updates on your dashboard as the review progresses.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              className="bg-ra-blue hover:bg-ra-blue-dark w-full"
              onClick={() => navigate('/customer-dashboard')}
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
