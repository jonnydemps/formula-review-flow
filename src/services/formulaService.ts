
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
  const { error } = await supabase.storage
    .from('formula_files')
    .upload(filePath, file);

  if (error) throw error;

  return filePath;
};

// Create formula record in the database
export const createFormula = async (customerId: string, filePath: string, originalFilename: string) => {
  const { data, error } = await supabase
    .from('formulas')
    .insert({
      customer_id: customerId,
      file_path: filePath,
      original_filename: originalFilename,
      status: 'pending_review'
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
};

// Get all formulas for a customer
export const getCustomerFormulas = async (customerId: string) => {
  const { data, error } = await supabase
    .from('formulas')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(formula => ({
    id: formula.id,
    name: formula.original_filename,
    originalFilename: formula.original_filename,
    uploadDate: new Date(formula.created_at).toISOString().split('T')[0],
    status: mapStatusToUI(formula.status),
    filePath: formula.file_path,
    quote: formula.quote_amount,
  }));
};

// Get all formulas for specialists
export const getAllFormulas = async () => {
  const { data, error } = await supabase
    .from('formulas')
    .select(`
      *,
      profiles:customer_id (
        name,
        id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(formula => ({
    id: formula.id,
    name: formula.original_filename,
    originalFilename: formula.original_filename,
    uploadDate: new Date(formula.created_at).toISOString().split('T')[0],
    status: mapStatusToUI(formula.status),
    filePath: formula.file_path,
    quote: formula.quote_amount,
    customerName: formula.profiles?.name || 'Unknown Customer',
    customerEmail: '', // Would need to join with auth.users which isn't directly possible
    customerId: formula.customer_id,
  }));
};

// Update formula status and quote
export const updateFormulaQuote = async (formulaId: string, quoteAmount: number) => {
  const { data, error } = await supabase
    .from('formulas')
    .update({
      quote_amount: quoteAmount,
      status: 'quote_provided'
    })
    .eq('id', formulaId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Mark formula as paid
export const markFormulaPaid = async (formulaId: string) => {
  const { data, error } = await supabase
    .from('formulas')
    .update({
      status: 'paid'
    })
    .eq('id', formulaId)
    .select()
    .single();

  if (error) throw error;
  return data;
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
