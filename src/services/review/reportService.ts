
import { supabase } from '@/integrations/supabase/client';
import { isCurrentUserAdmin } from './adminService';

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
