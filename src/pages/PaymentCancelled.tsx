
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const PaymentCancelled: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-none">
          <CardHeader className="border-b pb-3 text-center">
            <XCircle className="h-16 w-16 mx-auto text-gray-400 mb-2" />
            <CardTitle className="text-2xl font-bold text-gray-800">Payment Cancelled</CardTitle>
            <CardDescription className="text-gray-600">
              Your payment was not completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 mt-4 text-center">
            <p>You've cancelled the payment process. Your formula is still in our system.</p>
            <p className="text-sm text-gray-500">If you'd like to complete your payment later, you can return to your dashboard.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              className="bg-ra-blue hover:bg-ra-blue-dark w-full"
              onClick={() => navigate('/customer-dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancelled;
