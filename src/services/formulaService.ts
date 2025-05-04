
import { supabase } from "@/integrations/supabase/client";
import { FormulaStatus } from "@/types/auth";

// Ensure RLS is enabled in Supabase for formulas, profiles, and reviews tables.
// Policies should restrict access based on authenticated user roles (customer, admin).

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

export const uploadFormulaFile = async (file: File, filePath: string): Promise<string> => {
  try {
    // console.log("Uploading file:", file.name, "to path:", filePath);

    const { error } = await supabase.storage
      .from("formula_files")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Storage error: ${error.message}`);
    }

    // console.log("File uploaded successfully");
    return filePath;
  } catch (error: unknown) { // Use unknown instead of any
    console.error("File upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Upload failed: ${message}`);
  }
};

export const getFormulaFileUrl = async (filePath: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from("formula_files")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      throw error;
    }
    if (!data) {
        throw new Error("Failed to create signed URL.");
    }

    return data.signedUrl;
  } catch (error: unknown) { // Use unknown instead of any
    console.error("Error getting file URL:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get file URL: ${message}`);
  }
};

export const createFormula = async (customerId: string, filePath: string, originalFilename: string) => {
  try {
    // console.log("Creating formula record for customer:", customerId);

    // RLS policy should ensure only authenticated users can insert,
    // and customer_id matches the authenticated user's ID.
    const { data: formulaData, error: formulaError } = await supabase
      .from("formulas")
      .insert({
        customer_id: customerId, // RLS should verify this matches auth.uid()
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

    // console.log("Formula record created successfully:", formulaData);
    return formulaData;
  } catch (error: unknown) { // Use unknown instead of any
    console.error("Create formula error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to create formula record: ${message}`);
  }
};

export const markFormulaPaid = async (formulaId: string) => {
  try {
    // console.log("Marking formula as paid:", formulaId);
    // RLS policy should ensure only the customer who owns the formula
    // or an admin can update the status.
    const { data, error } = await supabase
      .from("formulas")
      .update({
        status: "paid",
      })
      .eq("id", formulaId)
      .select()
      .single();

    if (error) {
      console.error("Error marking formula as paid:", error);
      throw error;
    }

    // console.log("Formula marked as paid successfully:", data);
    return data;
  } catch (error: unknown) { // Use unknown instead of any
    console.error("Mark formula paid error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to mark formula as paid: ${message}`);
  }
};

export const getCustomerFormulas = async (customerId: string) => {
  try {
    // console.log("Fetching formulas for customer:", customerId);
    // RLS policy should ensure users can only select formulas where customer_id matches their auth.uid().
    const { data, error } = await supabase
      .from("formulas")
      .select("*")
      .eq("customer_id", customerId) // RLS makes this redundant but good for clarity
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customer formulas:", error);
      throw error;
    }

    return data || [];
  } catch (error: unknown) { // Use unknown instead of any
    console.error("Error fetching customer formulas:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load formulas: ${message}`);
  }
};

// This function should only be callable by users with an 'admin' role.
// RLS policy on 'formulas' table for SELECT should enforce this.
export const getAllFormulas = async () => {
  try {
    // console.log("Fetching all formulas (admin action)");
    // RLS policy must ensure only admins can perform this select without a customer_id filter.
    const { data, error } = await supabase
      .from("formulas")
      .select("*, profiles(name, email)") // Example: Join with profiles to get customer info
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all formulas:", error);
      throw error;
    }

    return data || [];
  } catch (error: unknown) { // Use unknown instead of any
    console.error("Error fetching all formulas:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to load all formulas: ${message}`);
  }
};

// Delete a formula from storage and then the database
export const deleteFormula = async (formulaId: string, filePath?: string) => {
  try {
    // console.log("Deleting formula:", formulaId);

    // 1. Delete the file from storage first to avoid orphans if DB delete fails later
    if (filePath) {
      // console.log("Deleting file from storage:", filePath);
      const { error: storageError } = await supabase.storage
        .from("formula_files")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting formula file from storage:", storageError);
        // Throw error here, as we don't want to proceed if storage deletion fails
        throw new Error(`Storage deletion failed: ${storageError.message}`);
      }
    }

    // 2. Delete any review data related to this formula
    // RLS policy should ensure only admins or the formula owner can delete reviews.
    const { error: reviewError } = await supabase
      .from("reviews")
      .delete()
      .eq("formula_id", formulaId);

    if (reviewError) {
      console.error("Error deleting associated review data:", reviewError);
      // Decide if this is critical. If reviews must be deleted, throw error.
      // If it's okay to proceed, just log.
      // For now, let's throw to ensure data consistency.
      throw new Error(`Failed to delete review data: ${reviewError.message}`);
    }

    // 3. Delete the formula record from the database
    // RLS policy should ensure only admins or the formula owner can delete.
    const { error: formulaError } = await supabase
      .from("formulas")
      .delete()
      .eq("id", formulaId);

    if (formulaError) {
      console.error("Error deleting formula record:", formulaError);
      throw formulaError;
    }

    // console.log("Formula successfully deleted");
    return true;
  } catch (error: unknown) { // Use unknown instead of any
    console.error("Delete formula error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    // Rethrow the error to be handled by the calling component/function
    throw new Error(`Failed to delete formula: ${message}`);
  }
};

