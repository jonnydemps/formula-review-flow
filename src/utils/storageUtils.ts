
import { supabase } from "@/integrations/supabase/client";

export const uploadFormulaFile = async (file: File, filePath: string): Promise<string> => {
  try {
    const { error } = await supabase.storage
      .from("formula_files")
      .upload(filePath, file);

    if (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Storage error: ${error.message}`);
    }

    return filePath;
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    console.error("Error getting file URL:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get file URL: ${message}`);
  }
};
