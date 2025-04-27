
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
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Create formula record in the database
export const createFormula = async (customerId: string, filePath: string, originalFilename: string) => {
  try {
    console.log('Creating formula record for customer:', customerId);
    
    // Use upsert with an empty 'insert' parameter to ensure RLS policies are correctly applied
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.error('No active session found:', error);
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
  } catch (error) {
    console.error('Create formula error:', error);
    throw error;
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
  } catch (error) {
    console.error('Mark formula paid error:', error);
    throw error;
  }
};
