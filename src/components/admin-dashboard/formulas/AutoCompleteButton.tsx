
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { autoCompleteReview } from '@/services/autoCompleteService';
import { Ingredient } from '@/services/review/types';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

interface AutoCompleteButtonProps {
  ingredients: Ingredient[];
  onIngredientsUpdate: (ingredients: Ingredient[]) => void;
  disabled?: boolean;
}

const AutoCompleteButton: React.FC<AutoCompleteButtonProps> = ({
  ingredients,
  onIngredientsUpdate,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAutoComplete = async () => {
    if (ingredients.length === 0) {
      showErrorToast(new Error('No ingredients to process'), 'Auto-Complete Failed');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting auto-complete process...');
      const updatedIngredients = await autoCompleteReview(ingredients);
      
      onIngredientsUpdate(updatedIngredients);
      showSuccessToast(`Auto-completed review for ${updatedIngredients.length} ingredients`);
      
    } catch (error: any) {
      console.error('Auto-complete error:', error);
      showErrorToast(error, 'Auto-Complete Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleAutoComplete}
      disabled={disabled || isProcessing || ingredients.length === 0}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="h-4 w-4" />
      )}
      {isProcessing ? 'Processing...' : 'Auto-Complete Review'}
    </Button>
  );
};

export default AutoCompleteButton;
