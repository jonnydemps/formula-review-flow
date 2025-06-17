
export interface Ingredient {
  id: string;
  name: string;
  percentage?: string;
  compliant: boolean;
  notes?: string;
  casNumber?: string;
  chemicalName?: string;
  aicsListed?: string;
  sir?: string;
  susmp?: string;
  nzoic?: string;
}

export interface ReviewData {
  reviewNotes: string;
  ingredients: Ingredient[];
  productName?: string;
  formulaNumber?: string;
}
