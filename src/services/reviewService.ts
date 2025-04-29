
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface Ingredient {
  id: string;
  name: string;
  percentage?: string;
  compliant: boolean;
  notes?: string;
}

export interface ReviewData {
  reviewNotes: string;
  ingredients: Ingredient[];
}

// Save review data for a formula
export const saveReview = async (formulaId: string, specialistId: string, reviewData: ReviewData) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .upsert({
        formula_id: formulaId,
        specialist_id: specialistId,
        review_data: reviewData as unknown as Json
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving review:', error);
    throw error;
  }
};

// Get review data for a formula
export const getReviewForFormula = async (formulaId: string) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('formula_id', formulaId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// Ensure review data conforms to the expected type
export const ensureReviewDataFormat = (data: any): ReviewData => {
  return {
    reviewNotes: data?.reviewNotes || '',
    ingredients: Array.isArray(data?.ingredients) 
      ? data.ingredients.map((ing: any) => ({
          id: ing?.id || String(Date.now()),
          name: ing?.name || '',
          percentage: ing?.percentage,
          compliant: typeof ing?.compliant === 'boolean' ? ing.compliant : true,
          notes: ing?.notes || ''
        }))
      : [{ id: '1', name: '', percentage: '', compliant: true, notes: '' }]
  };
};

// Generate and save report URL
export const generateReport = async (formulaId: string, specialistId: string) => {
  try {
    // In a real app, this would generate a PDF and store it in Supabase Storage
    const reportUrl = `formula-report-${formulaId}.pdf`;
    
    const { data, error } = await supabase
      .from('reviews')
      .update({
        report_url: reportUrl
      })
      .eq('formula_id', formulaId)
      .select()
      .single();

    if (error) throw error;

    // Also update formula status to completed
    const { error: formulaError } = await supabase
      .from('formulas')
      .update({
        status: 'completed'
      })
      .eq('id', formulaId);

    if (formulaError) throw formulaError;

    return data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};
