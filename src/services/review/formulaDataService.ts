
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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
