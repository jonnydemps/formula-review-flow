
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface Ingredient {
  id: string;
  name: string;
  percentage?: string;
  compliant: boolean;
  notes?: string;
  casNumber?: string;
}

export interface ReviewData {
  reviewNotes: string;
  ingredients: Ingredient[];
  productName?: string;
  formulaNumber?: string;
}

// Check if current user is admin
const isCurrentUserAdmin = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if user is admin by email or profile
    if (user.email === 'john-dempsey@hotmail.co.uk') {
      return true;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

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

// Generate and save report URL
export const generateReport = async (formulaId: string, specialistId: string) => {
  try {
    console.log('Generating report for formula:', formulaId);
    
    // Check if user is admin first
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      throw new Error('Only admin users can generate reports');
    }

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

    console.log('Report generated successfully');
    return data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

// Parse and save formula data from Excel
export const saveFormulaParsedData = async (formulaId: string, parsedData: any) => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .update({
        parsed_data: parsedData as unknown as Json
      })
      .eq('id', formulaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving parsed formula data:', error);
    throw error;
  }
};
