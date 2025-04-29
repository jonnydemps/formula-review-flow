
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFormulaFile, createFormula, markFormulaPaid } from '@/services/formulaService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormulaList from '@/components/customer-dashboard/FormulaList';
import UploadSection from '@/components/customer-dashboard/UploadSection';
import { supabase } from '@/integrations/supabase/client';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  // Protect route - redirect if not authenticated or not a customer
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'customer') {
      navigate('/specialist-dashboard');
    }
    
    // Check if the formula_files bucket exists, create if it doesn't
    const checkStorageBucket = async () => {
      try {
        const { data, error } = await supabase.storage.getBucket('formula_files');
        if (error) {
          // Bucket doesn't exist, create it
          await supabase.storage.createBucket('formula_files', {
            public: false
          });
          console.log('Created formula_files storage bucket');
        }
      } catch (error) {
        console.error('Error checking/creating storage bucket:', error);
      }
    };
    
    checkStorageBucket();
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

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (formulaId: string) => markFormulaPaid(formulaId),
    onSuccess: () => {
      toast.success('Payment successful! Your report will be ready soon.');
      queryClient.invalidateQueries({ queryKey: ['formulas', user?.id] });
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
      toast.error(`Failed to process payment: ${error.message}`);
    }
  });

  const handleFileUpload = async (file: File, path: string) => {
    setIsUploading(true);
    uploadMutation.mutate({ file, path });
  };

  const handleAcceptQuote = (id: string, quote: number) => {
    toast.success(`Redirecting to payment for $${quote}...`);
    setTimeout(() => {
      paymentMutation.mutate(id);
    }, 2000);
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
