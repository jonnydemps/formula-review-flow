
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFormulaFile, createFormula } from '@/services/formulaService';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  // Protect route - redirect if not authenticated or not a customer
  useEffect(() => {
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
    enabled: !!user && !authLoading,
    retry: 1,
    staleTime: 30000 // Cache for 30 seconds to reduce unnecessary requests
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

  return {
    user,
    authLoading,
    formulas,
    formulasLoading,
    isUploading,
    showUploader,
    setShowUploader,
    handleFileUpload,
    handleAcceptQuote,
    handleRefresh
  };
};
