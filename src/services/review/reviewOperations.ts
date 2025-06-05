
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { ReviewData } from './types';
import { isCurrentUserAdmin } from './adminService';

// Save review data for a formula
export const saveReview = async (formulaId: string, specialistId: string, reviewData: ReviewData) => {
  try {
    console.log('Attempting to save review for formula:', formulaId);
    
    // Check if user is admin first
    const isAdmin = await isCurrentUserAdmin();
    console.log('User is admin:', isAdmin);
    
    if (!isAdmin) {
      throw new Error('Only admin users can save reviews');
    }

    // Try to update existing review first
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('formula_id', formulaId)
      .maybeSingle();

    let result;
    
    if (existingReview) {
      console.log('Updating existing review:', existingReview.id);
      const { data, error } = await supabase
        .from('reviews')
        .update({
          specialist_id: specialistId,
          review_data: reviewData as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      console.log('Creating new review');
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          formula_id: formulaId,
          specialist_id: specialistId,
          review_data: reviewData as unknown as Json
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    console.log('Review saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving review:', error);
    throw error;
  }
};

// Get review data for a formula
export const getReviewForFormula = async (formulaId: string) => {
  try {
    console.log('Fetching review for formula:', formulaId);
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('formula_id', formulaId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
    
    console.log('Review fetched:', data);
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
    productName: data?.productName || '',
    formulaNumber: data?.formulaNumber || '',
    ingredients: Array.isArray(data?.ingredients) 
      ? data.ingredients.map((ing: any) => ({
          id: ing?.id || String(Date.now()),
          name: ing?.name || '',
          percentage: ing?.percentage,
          compliant: typeof ing?.compliant === 'boolean' ? ing.compliant : true,
          notes: ing?.notes || '',
          casNumber: ing?.casNumber || ''
        }))
      : [{ id: '1', name: '', percentage: '', compliant: true, notes: '', casNumber: '' }]
  };
};
