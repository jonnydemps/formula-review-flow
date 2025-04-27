
import { supabase } from '@/integrations/supabase/client';

export type FormulStatus = 'pending' | 'quote' | 'paid' | 'completed';

export interface Formula {
  id: string;
  name: string;
  originalFilename: string;
  uploadDate: string;
  status: FormulStatus;
  filePath: string;
  quote?: number;
  reportUrl?: string;
}

// Upload formula file to storage
export const uploadFormulaFile = async (file: File, filePath: string) => {
  try {
    console.log('Uploading file:', file.name, 'to path:', filePath);
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

// Get all formulas for a customer
export const getCustomerFormulas = async (customerId: string) => {
  try {
    console.log('Getting formulas for customer:', customerId);
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer formulas:', error);
      throw error;
    }

    console.log(`Found ${data.length} formula(s) for customer`);
    return data.map(formula => ({
      id: formula.id,
      name: formula.original_filename,
      originalFilename: formula.original_filename,
      uploadDate: new Date(formula.created_at).toISOString().split('T')[0],
      status: mapStatusToUI(formula.status),
      filePath: formula.file_path,
      quote: formula.quote_amount,
    }));
  } catch (error) {
    console.error('Get customer formulas error:', error);
    return [];
  }
};

// Get all formulas for specialists
export const getAllFormulas = async () => {
  try {
    console.log('Getting all formulas for specialist/admin view');
    // Fix the query to avoid the join that was causing issues
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all formulas:', error);
      throw error;
    }

    // Process formulas without the profiles join that was causing issues
    const formulas = data.map(formula => ({
      id: formula.id,
      name: formula.original_filename,
      originalFilename: formula.original_filename,
      uploadDate: new Date(formula.created_at).toISOString().split('T')[0],
      status: mapStatusToUI(formula.status),
      filePath: formula.file_path,
      quote: formula.quote_amount,
      customerId: formula.customer_id,
      // We'll set placeholder values for customer info
      customerName: 'Customer',
      customerEmail: ''
    }));
    
    console.log(`Found ${formulas.length} formula(s) total`);
    return formulas;
  } catch (error) {
    console.error('Get all formulas error:', error);
    return [];
  }
};

// Update formula status and quote
export const updateFormulaQuote = async (formulaId: string, quoteAmount: number) => {
  try {
    console.log('Updating formula quote:', formulaId, quoteAmount);
    const { data, error } = await supabase
      .from('formulas')
      .update({
        quote_amount: quoteAmount,
        status: 'quote_provided'
      })
      .eq('id', formulaId)
      .select()
      .single();

    if (error) {
      console.error('Error updating formula quote:', error);
      throw error;
    }
    
    console.log('Formula quote updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Update formula quote error:', error);
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

// Helper to map database status to UI status
const mapStatusToUI = (dbStatus: string | null): FormulStatus => {
  switch(dbStatus) {
    case 'pending_review': return 'pending';
    case 'quote_provided': return 'quote';
    case 'paid': return 'paid';
    case 'completed': return 'completed' as FormulStatus;
    default: return 'pending';
  }
};

// Helper to map UI status to database status
export const mapUIToDbStatus = (uiStatus: FormulStatus): string => {
  switch(uiStatus) {
    case 'pending': return 'pending_review';
    case 'quote': return 'quote_provided';
    case 'paid': return 'paid';
    case 'completed': return 'completed';
    default: return 'pending_review';
  }
};
