
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFormulaFile, createFormula } from '@/services/formulaService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormulaList from '@/components/customer-dashboard/FormulaList';
import UploadSection from '@/components/customer-dashboard/UploadSection';
import { supabase } from '@/integrations/supabase/client';
import { handlePaymentSuccess } from '@/services/paymentService';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const paymentSuccess = queryParams.get('payment_success');
  const formulaId = queryParams.get('formula_id');
  
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
    
    if (queryParams.get('payment_cancelled') === 'true') {
      toast.info('Payment was cancelled.');
      // Remove query params from URL
      navigate('/customer-dashboard', { replace: true });
    }
  }, [paymentSuccess, formulaId, navigate, queryClient, user]);

  // Protect route - redirect if not authenticated or not a customer
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'customer') {
      navigate('/admin-dashboard');
    }
  }, [user, navigate]);

  // Custom fetch function to get customer formulas - simplified now that RLS is disabled
  const getCustomerFormulas = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('formulas')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Customer formulas:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching formulas:', error);
      return [];
    }
  };

  // Fetch formulas for the customer
  const { data: formulas = [], isLoading, refetch } = useQuery({
    queryKey: ['formulas', user?.id],
    queryFn: getCustomerFormulas,
    enabled: !!user
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
                  isLoading={isLoading}
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
