
import { getMasterIngredientByCAS } from './masterIngredientsService';
import { Ingredient } from './review/types';

export interface AutoCompleteResult {
  ingredient: Ingredient;
  masterData: {
    chemical_name: string;
    aics_listed: string;
    specific_information_requirement: string;
    susmp: string;
    nzoic: string;
  } | null;
}

export const autoCompleteReview = async (ingredients: Ingredient[]): Promise<Ingredient[]> => {
  console.log('Starting auto-complete for', ingredients.length, 'ingredients');
  
  const updatedIngredients: Ingredient[] = [];
  
  for (const ingredient of ingredients) {
    try {
      // Look up master data by CAS number
      const masterData = await getMasterIngredientByCAS(ingredient.casNumber);
      
      let updatedIngredient = { ...ingredient };
      
      if (masterData) {
        console.log(`Found master data for CAS ${ingredient.casNumber}:`, masterData);
        
        updatedIngredient = {
          ...ingredient,
          chemicalName: masterData.chemical_name || '',
          aicsListed: masterData.aics_listed || '',
          sir: masterData.specific_information_requirement || '',
          susmp: masterData.susmp || '',
          nzoic: masterData.nzoic || '',
          compliant: true // Default to compliant, admin can change if needed
        };
      } else {
        console.log(`No master data found for CAS ${ingredient.casNumber}`);
        updatedIngredient = {
          ...ingredient,
          notes: 'CAS not found',
          compliant: false // Default to non-compliant when CAS not found
        };
      }
      
      updatedIngredients.push(updatedIngredient);
    } catch (error) {
      console.error(`Error processing ingredient with CAS ${ingredient.casNumber}:`, error);
      
      // Add ingredient with error note
      updatedIngredients.push({
        ...ingredient,
        notes: 'Error retrieving data',
        compliant: false
      });
    }
  }
  
  console.log('Auto-complete finished, processed', updatedIngredients.length, 'ingredients');
  return updatedIngredients;
};
