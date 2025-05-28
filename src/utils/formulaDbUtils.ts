
import { supabase } from "@/integrations/supabase/client";
import { FormulaStatus } from "@/types/auth";

export const createFormulaRecord = async (customerId: string, filePath: string, originalFilename: string) => {
  try {
    const { data: formulaData, error: formulaError } = await supabase
      .from("formulas")
      .insert({
        customer_id: customerId,
        file_path: filePath,
        original_filename: originalFilename,
        status: "pending_review",
      })
      .select("*")
      .single();

    if (formulaError) {
      console.error("Error creating formula record:", formulaError);
      throw formulaError;
    }

    return formulaData;
  } catch (error: unknown) {
    console.error("Create formula error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create formula record: ${message}`);
  }
};

export const updateFormulaStatus = async (formulaId: string, status: FormulaStatus) => {
  try {
    const { data, error } = await supabase
      .from("formulas")
      .update({ status })
      .eq("id", formulaId)
      .select()
      .single();

    if (error) {
      console.error("Error updating formula status:", error);
      throw error;
    }

    return data;
  } catch (error: unknown) {
    console.error("Update formula status error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update formula status: ${message}`);
  }
};

export const deleteFormulaData = async (formulaId: string) => {
  try {
    // Delete any review data related to this formula
    const { error: reviewError } = await supabase
      .from("reviews")
      .delete()
      .eq("formula_id", formulaId);

    if (reviewError) {
      console.error("Error deleting associated review data:", reviewError);
      throw new Error(`Failed to delete review data: ${reviewError.message}`);
    }

    // Delete the formula record from the database
    const { error: formulaError } = await supabase
      .from("formulas")
      .delete()
      .eq("id", formulaId);

    if (formulaError) {
      console.error("Error deleting formula record:", formulaError);
      throw formulaError;
    }

    return true;
  } catch (error: unknown) {
    console.error("Delete formula data error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete formula data: ${message}`);
  }
};
