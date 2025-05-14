
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFormulaFile, createFormula } from '@/services/formulaService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormulaList from '@/components/customer-dashboard/FormulaList';
import UploadSection from '@/components/customer-dashboard/UploadSection';
import { supabase } from '@/integrations/supabase/client';
import { handlePaymentSuccess } from '@/services/paymentService';

const CustomerDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  console.log('Dashboard rendering, auth state:', { user, authLoading });

  // Get query parameters
  const paymentSuccess = searchParams.get('payment_success');
  const formulaId = searchParams.get('formula_id');
  
  // Handle payment success redirect
  useEffect(() => {
    if (paymentSuccess === 'true' && formulaId) {
      // Update formula status to paid
      handlePaymentSuccess(formulaId)
        .then(() => {
          toast.success('Payment successful! Your formula is now being reviewed.');
          // Remove query params from URL
          navigate('/customer-dashboard', { replace: true });
          // Refresh formulas list
          queryClient.invalidateQueries({ queryKey: ['formulas', user?.id] });
        })
        .catch(error => {
          toast.error(`Error processing payment confirmation: ${error.message}`);
        });
    }
    
    if (searchParams.get('payment_cancelled') === 'true') {
      toast.info('Payment was cancelled.');
      // Remove query params from URL
      navigate('/customer-dashboard', { replace: true });
    }
  }, [paymentSuccess, formulaId, navigate, queryClient, user, searchParams]);

  // Protect route - redirect if not authenticated or not a customer
  useEffect(() => {
    console.log('Auth check effect running, user:', user, 'loading:', authLoading);
    
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to sign-in');
      navigate('/sign-in');
    } else if (!authLoading && user && user.role !== 'customer') {
      console.log('User is not a customer, redirecting to admin dashboard');
      navigate('/admin-dashboard');
    }
  }, [user, authLoading, navigate]);

  // Custom fetch function to get customer formulas
  const getCustomerFormulas = async () => {
    if (!user) {
      console.log('No user, cannot fetch formulas');
      return [];
    }
    
    try {
      console.log('Fetching formulas for customer:', user.id);
      const { data, error } = await supabase
        .from('formulas')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching formulas:', error);
        throw error;
      }
      
      console.log('Customer formulas:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching formulas:', error);
      return [];
    }
  };

  // Fetch formulas for the customer
  const { data: formulas = [], isLoading: formulasLoading, refetch } = useQuery({
    queryKey: ['formulas', user?.id],
    queryFn: getCustomerFormulas,
    enabled: !!user,
    retry: 1
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, path }: { file: File, path: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // First upload the file to storage
      const filePath = await uploadFormulaFile(file, path);
      console.log('File uploaded to storage, path:', filePath);
      
      // Then create the formula record
      return createFormula(user.id, filePath, file.name);
    },
    onSuccess: () => {
      setShowUploader(false);
      toast.success('Formula uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['formulas', user?.id] });
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error(`Failed to upload formula: ${error.message}`);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleFileUpload = async (file: File, path: string) => {
    setIsUploading(true);
    uploadMutation.mutate({ file, path });
  };

  const handleAcceptQuote = (id: string, quote: number) => {
    navigate('/payment', { 
      state: { 
        formulaId: id, 
        amount: quote 
      } 
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing formulas...');
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if no user (should be handled by the useEffect, but this is a fallback)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Customer Dashboard</h1>
                <p className="text-gray-600">
                  Upload formulas, track reviews, and download reports
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
            
            <UploadSection 
              showUploader={showUploader}
              isUploading={isUploading}
              onFileUpload={handleFileUpload}
              onCancel={() => setShowUploader(false)}
              onShowUploader={() => setShowUploader(true)}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Your Formulas</CardTitle>
                <CardDescription>
                  Track the status of your formula reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormulaList 
                  formulas={formulas}
                  isLoading={formulasLoading}
                  onAcceptQuote={handleAcceptQuote}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
