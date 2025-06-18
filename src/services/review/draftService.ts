
import { supabase } from '@/integrations/supabase/client';
import { ReviewData } from './types';
import { Json } from '@/integrations/supabase/types';

export const saveDraftReview = async (formulaId: string, specialistId: string, reviewData: ReviewData) => {
  try {
    console.log('Saving draft review for formula:', formulaId);
    
    // Check if review exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('formula_id', formulaId)
      .maybeSingle();

    let result;
    
    if (existingReview) {
      // Update existing review as draft
      const { data, error } = await supabase
        .from('reviews')
        .update({
          specialist_id: specialistId,
          review_data: reviewData as unknown as Json,
          is_draft: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new draft review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          formula_id: formulaId,
          specialist_id: specialistId,
          review_data: reviewData as unknown as Json,
          is_draft: true
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Update formula status to in_review_draft if it's currently paid
    const { error: formulaError } = await supabase
      .from('formulas')
      .update({ status: 'in_review_draft' })
      .eq('id', formulaId)
      .eq('status', 'paid'); // Only update if currently paid

    if (formulaError) {
      console.error('Error updating formula status:', formulaError);
    }

    console.log('Draft review saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving draft review:', error);
    throw error;
  }
};

export const completeReview = async (formulaId: string, specialistId: string, reviewData: ReviewData) => {
  try {
    console.log('Completing review for formula:', formulaId);
    
    const completedAt = new Date().toISOString();
    
    // Check if review exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('formula_id', formulaId)
      .maybeSingle();

    let result;
    
    if (existingReview) {
      // Update existing review to completed
      const { data, error } = await supabase
        .from('reviews')
        .update({
          specialist_id: specialistId,
          review_data: reviewData as unknown as Json,
          is_draft: false,
          completed_at: completedAt,
          updated_at: completedAt
        })
        .eq('id', existingReview.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new completed review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          formula_id: formulaId,
          specialist_id: specialistId,
          review_data: reviewData as unknown as Json,
          is_draft: false,
          completed_at: completedAt
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Update formula status to review_completed
    const { error: formulaError } = await supabase
      .from('formulas')
      .update({ 
        status: 'review_completed',
        review_completed_at: completedAt
      })
      .eq('id', formulaId);

    if (formulaError) {
      console.error('Error updating formula status:', formulaError);
      throw formulaError;
    }

    console.log('Review completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Error completing review:', error);
    throw error;
  }
};

export const sendReviewToClient = async (formulaId: string) => {
  try {
    console.log('Sending review to client for formula:', formulaId);
    
    const sentAt = new Date().toISOString();
    
    // Update review to mark it as sent to client
    const { error: reviewError } = await supabase
      .from('reviews')
      .update({
        sent_to_client_at: sentAt,
        updated_at: sentAt
      })
      .eq('formula_id', formulaId);

    if (reviewError) {
      console.error('Error updating review sent status:', reviewError);
      throw reviewError;
    }

    // Update formula status to sent_to_client
    const { error: formulaError } = await supabase
      .from('formulas')
      .update({ 
        status: 'sent_to_client',
        sent_to_client_at: sentAt
      })
      .eq('id', formulaId);

    if (formulaError) {
      console.error('Error updating formula status:', formulaError);
      throw formulaError;
    }

    console.log('Review sent to client successfully');
    return true;
  } catch (error) {
    console.error('Error sending review to client:', error);
    throw error;
  }
};
