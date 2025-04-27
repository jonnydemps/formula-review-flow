
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  }, [user, navigate]);

  // Custom fetch function to get customer formulas
  const getCustomerFormulas = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('formulas')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching formulas:', error);
      return [];
    }
  };

  // Fetch formulas for the customer
  const { data: formulas = [], isLoading } = useQuery({
    queryKey: ['formulas', user?.id],
    queryFn: getCustomerFormulas,
    enabled: !!user
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, path }: { file: File, path: string }) => {
      if (!user) throw new Error('User not authenticated');
      const filePath = await uploadFormulaFile(file, path);
      return createFormula(user.id, filePath, file.name);
    },
    onSuccess: () => {
      setShowUploader(false);
      toast.success('Formula uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['formulas', user?.id] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload formula');
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
    onError: (error) => {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Upload formulas, track reviews, and download reports
            </p>
            
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
