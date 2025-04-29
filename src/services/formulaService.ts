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

export const getFormulaFileUrl = async (filePath: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('formula_files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error: any) {
    console.error('Error getting file URL:', error);
    throw new Error(`Failed to get file URL: ${error.message || 'Unknown error'}`);
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
    
    // Since RLS is disabled, we can insert directly
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
    // Now that RLS is disabled, we can query directly without joins
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

// Delete a formula from the database and storage
export const deleteFormula = async (formulaId: string, filePath?: string) => {
  try {
    console.log('Deleting formula:', formulaId);
    
    // First delete the formula record
    const { error: formulaError } = await supabase
      .from('formulas')
      .delete()
      .eq('id', formulaId);
      
    if (formulaError) {
      console.error('Error deleting formula record:', formulaError);
      throw formulaError;
    }
    
    // If we have a file path, also delete the file from storage
    if (filePath) {
      console.log('Deleting file from storage:', filePath);
      const { error: storageError } = await supabase.storage
        .from('formula_files')
        .remove([filePath]);
        
      if (storageError) {
        console.error('Error deleting formula file from storage:', storageError);
        // We don't throw here because we already deleted the record
        // Just log the error and continue
      }
    }
    
    // Also delete any review data related to this formula
    const { error: reviewError } = await supabase
      .from('reviews')
      .delete()
      .eq('formula_id', formulaId);
      
    if (reviewError) {
      console.error('Error deleting associated review data:', reviewError);
      // We don't throw here because the main record is already deleted
    }
    
    console.log('Formula successfully deleted');
    return true;
  } catch (error: any) {
    console.error('Delete formula error:', error);
    throw new Error(`Failed to delete formula: ${error.message || 'Unknown error'}`);
  }
};
