
import { supabase } from "@/integrations/supabase/client";
import { FormulaStatus } from "@/types/auth";
import { uploadFormulaFile, getFormulaFileUrl } from "@/utils/storageUtils";
import { createFormulaRecord, updateFormulaStatus, deleteFormulaData } from "@/utils/formulaDbUtils";

export interface Formula {
  id: string;
  name: string;
  originalFilename: string;
  uploadDate: string;
  status: FormulaStatus;
  filePath: string;
  quote?: number;
  reportUrl?: string;
}

// Re-export storage utilities for backward compatibility
export { uploadFormulaFile, getFormulaFileUrl };

export const createFormula = async (customerId: string, filePath: string, originalFilename: string) => {
  return createFormulaRecord(customerId, filePath, originalFilename);
};

export const markFormulaPaid = async (formulaId: string) => {
  return updateFormulaStatus(formulaId, "paid");
};

export const getCustomerFormulas = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from("formulas")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customer formulas:", error);
      throw error;
    }

    return data || [];
  } catch (error: unknown) {
    console.error("Error fetching customer formulas:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load formulas: ${message}`);
  }
};

export const getAllFormulas = async () => {
  try {
    const { data, error } = await supabase
      .from("formulas")
      .select("*, profiles(name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all formulas:", error);
      throw error;
    }

    return data || [];
  } catch (error: unknown) {
    console.error("Error fetching all formulas:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load all formulas: ${message}`);
  }
};

export const deleteFormula = async (formulaId: string, filePath?: string) => {
  try {
    // Delete the file from storage first
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("formula_files")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting formula file from storage:", storageError);
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }
    }

    // Delete database records
    await deleteFormulaData(formulaId);

    return true;
  } catch (error: unknown) {
    console.error("Delete formula error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete formula: ${message}`);
  }
};
