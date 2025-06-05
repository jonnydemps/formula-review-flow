
export interface Ingredient {
  id: string;
  name: string;
  percentage?: string;
  compliant: boolean;
  notes?: string;
  casNumber?: string;
}

export interface ReviewData {
  reviewNotes: string;
  ingredients: Ingredient[];
  productName?: string;
  formulaNumber?: string;
}
