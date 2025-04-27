
export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name: string) => Promise<void>;
  signOut: () => void;
}

// This matches the Supabase formula_status enum type
export type FormulaStatus = 'pending_review' | 'quote_requested' | 'quote_provided' | 'paid' | 'completed';

export interface Formula {
  id: string;
  original_filename: string;
  file_path: string;
  customer_id: string;
  status: FormulaStatus;
  created_at: string;
  updated_at: string | null;
  quote_amount: number | null;
  quote_requested_at: string | null;
  batch_request_id: string | null;
}
