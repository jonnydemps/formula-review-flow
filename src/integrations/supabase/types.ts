export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      formulas: {
        Row: {
          batch_request_id: string | null
          created_at: string | null
          customer_id: string | null
          file_path: string
          id: string
          original_filename: string
          parsed_data: Json | null
          quote_amount: number | null
          quote_requested_at: string | null
          review_completed_at: string | null
          sent_to_client_at: string | null
          status: Database["public"]["Enums"]["formula_status"] | null
          updated_at: string | null
        }
        Insert: {
          batch_request_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          file_path: string
          id?: string
          original_filename: string
          parsed_data?: Json | null
          quote_amount?: number | null
          quote_requested_at?: string | null
          review_completed_at?: string | null
          sent_to_client_at?: string | null
          status?: Database["public"]["Enums"]["formula_status"] | null
          updated_at?: string | null
        }
        Update: {
          batch_request_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          file_path?: string
          id?: string
          original_filename?: string
          parsed_data?: Json | null
          quote_amount?: number | null
          quote_requested_at?: string | null
          review_completed_at?: string | null
          sent_to_client_at?: string | null
          status?: Database["public"]["Enums"]["formula_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formulas_customer_profile_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      master_ingredients: {
        Row: {
          aics_listed: string | null
          cas_number: string
          chemical_name: string | null
          created_at: string
          id: string
          nzoic: string | null
          specific_information_requirement: string | null
          susmp: string | null
          updated_at: string
        }
        Insert: {
          aics_listed?: string | null
          cas_number: string
          chemical_name?: string | null
          created_at?: string
          id?: string
          nzoic?: string | null
          specific_information_requirement?: string | null
          susmp?: string | null
          updated_at?: string
        }
        Update: {
          aics_listed?: string | null
          cas_number?: string
          chemical_name?: string | null
          created_at?: string
          id?: string
          nzoic?: string | null
          specific_information_requirement?: string | null
          susmp?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      master_ingredients_uploads: {
        Row: {
          filename: string
          id: string
          records_count: number
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          filename: string
          id?: string
          records_count?: number
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          filename?: string
          id?: string
          records_count?: number
          upload_date?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          completed_at: string | null
          created_at: string | null
          formula_id: string | null
          id: string
          is_draft: boolean | null
          report_url: string | null
          review_data: Json | null
          sent_to_client_at: string | null
          specialist_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          formula_id?: string | null
          id?: string
          is_draft?: boolean | null
          report_url?: string | null
          review_data?: Json | null
          sent_to_client_at?: string | null
          specialist_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          formula_id?: string | null
          id?: string
          is_draft?: boolean | null
          report_url?: string | null
          review_data?: Json | null
          sent_to_client_at?: string | null
          specialist_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      formula_status:
        | "pending_review"
        | "quote_provided"
        | "paid"
        | "completed"
        | "quote_requested"
        | "in_review_draft"
        | "review_completed"
        | "sent_to_client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      formula_status: [
        "pending_review",
        "quote_provided",
        "paid",
        "completed",
        "quote_requested",
        "in_review_draft",
        "review_completed",
        "sent_to_client",
      ],
    },
  },
} as const
