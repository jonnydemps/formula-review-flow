export interface Formula {
  id: string;
  customer_id: string;
  file_path: string;
  original_filename: string;
  status: string;
  quote_amount: number | null;
  created_at: string;
  updated_at: string;
  quote_requested_at: string | null;
  batch_request_id: string | null;
  parsed_data: any | null;
  review_completed_at: string | null;
  sent_to_client_at: string | null;
  profiles?: {
    name: string;
    email: string;
  };
}

export interface ParsedIngredient {
  cas_number: string;
  inci_name: string;
  percentage: number;
  function?: string;
}

export interface ParsedFormulaData {
  ingredients: ParsedIngredient[];
  product_name?: string;
  product_type?: string;
  total_percentage?: number;
}

export interface ReviewData {
  ingredients: ReviewIngredient[];
  comments?: string;
  recommendations?: string;
  compliance_status?: 'compliant' | 'non_compliant' | 'needs_review';
}

export interface ReviewIngredient {
  cas_number: string;
  inci_name: string;
  percentage: number;
  function?: string;
  compliance_status: 'approved' | 'restricted' | 'banned' | 'needs_review';
  comments?: string;
  regulatory_notes?: string;
}

export interface Review {
  id: string;
  formula_id: string;
  specialist_id: string | null;
  review_data: ReviewData | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  sent_to_client_at: string | null;
  is_draft: boolean;
  report_url: string | null;
}

export interface MasterIngredient {
  id: string;
  cas_number: string;
  chemical_name: string | null;
  aics_listed: string | null;
  specific_information_requirement: string | null;
  susmp: string | null;
  nzoic: string | null;
  created_at: string;
  updated_at: string;
}