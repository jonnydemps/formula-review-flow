
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export interface MasterIngredient {
  id: string;
  cas_number: string;
  chemical_name: string;
  aics_listed: string;
  specific_information_requirement: string;
  susmp: string;
  nzoic: string;
  created_at: string;
  updated_at: string;
}

export interface ParsedMasterIngredient {
  cas_number: string;
  chemical_name: string;
  aics_listed: string;
  specific_information_requirement: string;
  susmp: string;
  nzoic: string;
}

export const parseMasterIngredientsExcel = async (file: File): Promise<ParsedMasterIngredient[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row handling
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Parse ingredients starting from row 1 (assuming headers in row 0)
        const ingredients: ParsedMasterIngredient[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length >= 6) {
            const cas_number = row[0]?.toString().trim() || '';
            const chemical_name = row[1]?.toString().trim() || '';
            const aics_listed = row[2]?.toString().trim() || '';
            const specific_information_requirement = row[3]?.toString().trim() || '';
            const susmp = row[4]?.toString().trim() || '';
            const nzoic = row[5]?.toString().trim() || '';
            
            // Only add if we have at least a CAS number
            if (cas_number) {
              ingredients.push({
                cas_number,
                chemical_name,
                aics_listed,
                specific_information_requirement,
                susmp,
                nzoic
              });
            }
          }
        }
        
        resolve(ingredients);
      } catch (error) {
        console.error('Error parsing master ingredients Excel file:', error);
        reject(new Error('Failed to parse Excel file. Please ensure it follows the expected format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

export const uploadMasterIngredients = async (ingredients: ParsedMasterIngredient[], filename: string) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Clear existing master ingredients
    const { error: deleteError } = await supabase
      .from('master_ingredients')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error clearing existing master ingredients:', deleteError);
      throw deleteError;
    }

    // Insert new master ingredients
    const { error: insertError } = await supabase
      .from('master_ingredients')
      .insert(ingredients);

    if (insertError) {
      console.error('Error inserting master ingredients:', insertError);
      throw insertError;
    }

    // Log the upload
    const { error: logError } = await supabase
      .from('master_ingredients_uploads')
      .insert({
        filename,
        uploaded_by: user.id,
        records_count: ingredients.length
      });

    if (logError) {
      console.error('Error logging upload:', logError);
      // Don't throw here as the main operation succeeded
    }

    return { success: true, count: ingredients.length };
  } catch (error: unknown) {
    console.error('Upload master ingredients error:', error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to upload master ingredients: ${message}`);
  }
};

export const getMasterIngredientByCAS = async (casNumber: string): Promise<MasterIngredient | null> => {
  try {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .eq('cas_number', casNumber.trim())
      .maybeSingle();

    if (error) {
      console.error('Error fetching master ingredient:', error);
      throw error;
    }

    return data;
  } catch (error: unknown) {
    console.error('Get master ingredient error:', error);
    return null;
  }
};

export const getAllMasterIngredients = async (): Promise<MasterIngredient[]> => {
  try {
    const { data, error } = await supabase
      .from('master_ingredients')
      .select('*')
      .order('chemical_name');

    if (error) {
      console.error('Error fetching all master ingredients:', error);
      throw error;
    }

    return data || [];
  } catch (error: unknown) {
    console.error('Get all master ingredients error:', error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch master ingredients: ${message}`);
  }
};
