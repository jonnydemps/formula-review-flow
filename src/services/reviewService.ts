
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
};

// Get review data for a formula
export const getReviewForFormula = async (formulaId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('formula_id', formulaId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Generate and save report URL
export const generateReport = async (formulaId: string, specialistId: string) => {
  // In a real app, this would generate a PDF and store it in Supabase Storage
  const reportUrl = `formula-report-${formulaId}.pdf`;
  
  const { data, error } = await supabase
    .from('reviews')
    .update({
      report_url: reportUrl
    })
    .eq('formula_id', formulaId)
    .eq('specialist_id', specialistId)
    .select()
    .single();

  if (error) throw error;

  // Also update formula status to completed
  await supabase
    .from('formulas')
    .update({
      status: 'completed'
    })
    .eq('id', formulaId);

  return data;
};
