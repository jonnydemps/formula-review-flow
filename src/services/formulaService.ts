
import { supabase } from '@/integrations/supabase/client';
import { FormulaStatus } from '@/types/auth';

export interface Formula {
  id: string;
  name: string;
  originalFilename: string;
  uploadDate: string;
  status: FormulaStatus;
  filePath: string;
  quote?: number;
  reportUrl?: string;
}

export const uploadFormulaFile = async (file: File, filePath: string) => {
  try {
    console.log('Uploading file:', file.name, 'to path:', filePath);
    
    const { error } = await supabase.storage
      .from('formula_files')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Storage error: ${error.message}`);
    }

    console.log('File uploaded successfully');
    return filePath;
  } catch (error: any) {
    console.error('File upload error:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
};

export const createFormula = async (customerId: string, filePath: string, originalFilename: string) => {
  try {
    console.log('Creating formula record for customer:', customerId);
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('No active session found:', sessionError);
      throw new Error('Authentication required to upload formulas');
    }
    
    const { data: formulaData, error: formulaError } = await supabase
      .from('formulas')
      .insert({
        customer_id: customerId,
        file_path: filePath,
        original_filename: originalFilename,
        status: 'pending_review'
      })
      .select('*')
      .single();

    if (formulaError) {
      console.error('Error creating formula record:', formulaError);
      throw formulaError;
    }
    
    console.log('Formula record created successfully:', formulaData);
    return formulaData;
  } catch (error: any) {
    console.error('Create formula error:', error);
    throw new Error(`Failed to create formula record: ${error.message || 'Unknown error'}`);
  }
};

export const markFormulaPaid = async (formulaId: string) => {
  try {
    console.log('Marking formula as paid:', formulaId);
    const { data, error } = await supabase
      .from('formulas')
      .update({
        status: 'paid'
      })
      .eq('id', formulaId)
      .select()
      .single();

    if (error) {
      console.error('Error marking formula as paid:', error);
      throw error;
    }
    
    console.log('Formula marked as paid successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Mark formula paid error:', error);
    throw new Error(`Failed to mark formula as paid: ${error.message || 'Unknown error'}`);
  }
};

export const getCustomerFormulas = async (customerId: string) => {
  try {
    console.log('Fetching formulas for customer:', customerId);
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching formulas:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching formulas:', error);
    throw new Error(`Failed to load formulas: ${error.message || 'Unknown error'}`);
  }
};

export const getAllFormulas = async () => {
  try {
    // Get all formulas first
    const { data: formulasData, error: formulasError } = await supabase
      .from('formulas')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (formulasError) {
      console.error('Error fetching all formulas:', formulasError);
      throw formulasError;
    }
    
    // If we have formulas and they have customer IDs, fetch customer profiles
    if (formulasData && formulasData.length > 0) {
      const customerIds = formulasData
        .map(formula => formula.customer_id)
        .filter(id => id !== null);
      
      if (customerIds.length > 0) {
        // Get unique customer IDs
        const uniqueCustomerIds = [...new Set(customerIds)];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', uniqueCustomerIds);
        
        // If profiles were successfully fetched, join them with the formula data
        if (!profilesError && profilesData) {
          const customerMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          
          // Add customer data to formulas
          return formulasData.map(formula => {
            const customer = formula.customer_id ? customerMap[formula.customer_id] : null;
            
            return {
              ...formula,
              customer_name: customer?.name || 'Unknown User',
              customer_email: null // Email is not in profiles table
            };
          });
        }
      }
    }
    
    // If we couldn't join with profiles, just return the formulas
    return formulasData || [];
  } catch (error: any) {
    console.error('Error fetching all formulas:', error);
    throw new Error(`Failed to load formulas: ${error.message || 'Unknown error'}`);
  }
};
