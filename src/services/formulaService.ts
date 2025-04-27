
import { supabase } from '@/integrations/supabase/client';
import { FormulaStatus } from '@/types/auth';
import { toast } from 'sonner';

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

// Upload formula file to storage
export const uploadFormulaFile = async (file: File, filePath: string) => {
  try {
    console.log('Uploading file:', file.name, 'to path:', filePath);
    
    // Ensure the formula_files bucket exists (You may need to create it in Supabase dashboard)
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error checking buckets:', bucketError);
      throw bucketError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'formula_files');
    
    if (!bucketExists) {
      console.warn('formula_files bucket does not exist, uploads may fail');
      // Note: You need to create the bucket in Supabase dashboard if it doesn't exist
      toast.error('Storage bucket not configured correctly. Please contact support.');
      throw new Error('Storage bucket not configured');
    }
    
    const { error } = await supabase.storage
      .from('formula_files')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    console.log('File uploaded successfully');
    return filePath;
  } catch (error: any) {
    console.error('File upload error:', error);
    throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
  }
};

// Create formula record in the database
export const createFormula = async (customerId: string, filePath: string, originalFilename: string) => {
  try {
    console.log('Creating formula record for customer:', customerId);
    
    // Check for active session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('No active session found:', sessionError);
      throw new Error('Authentication required to upload formulas');
    }
    
    // Create the formula entry
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

// Mark formula as paid
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

// Fetch formulas for a customer
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

// Fetch all formulas (admin function)
export const getAllFormulas = async () => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all formulas:', error);
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching all formulas:', error);
    throw new Error(`Failed to load formulas: ${error.message || 'Unknown error'}`);
  }
};
