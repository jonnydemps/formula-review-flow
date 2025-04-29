
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import FormulaDetailsDialog from '@/components/formula-details/FormulaDetailsDialog';
import FormulaReviewDialog from '@/components/admin-dashboard/formulas/FormulaReviewDialog';

interface FormulaActionsProps {
  formula: any;
  onProvideQuote: (id: string, amount: number) => void;
  onRefresh?: () => void;
}

const FormulaActions: React.FC<FormulaActionsProps> = ({
  formula,
  onProvideQuote,
  onRefresh
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  
  // Quote state
  const [isProvidingQuote, setIsProvidingQuote] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  
  const handleDetailsClick = () => {
    setIsDetailsOpen(true);
  };
  
  const handleReviewClick = () => {
    setIsReviewOpen(true);
  };

  const handleProvideQuote = () => {
    const amount = parseInt(quoteAmount.trim());
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid quote amount');
      return;
    }
    
    onProvideQuote(formula.id, amount);
    setIsProvidingQuote(false);
    setQuoteAmount('');
  };

  const handleReviewComplete = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="flex space-x-2">
      {/* View Details Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDetailsClick}
      >
        <Eye className="h-4 w-4 mr-1" />
        Details
      </Button>
      
      {/* Review Formula Button */}
      <Button
        variant={formula.status === 'paid' ? 'default' : 'outline'}
        size="sm"
        onClick={handleReviewClick}
      >
        <FileText className="h-4 w-4 mr-1" />
        {formula.status === 'paid' ? 'Review' : 'View'}
      </Button>
      
      {/* Quote Actions */}
      {formula.status === 'quote_requested' && (
        isProvidingQuote ? (
          <div className="flex space-x-1">
            <input
              type="number"
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              placeholder="$ Amount"
              className="w-20 h-8 text-sm px-2 border rounded"
            />
            <Button
              size="sm"
              onClick={handleProvideQuote}
            >
              <Check className="h-3 w-3 mr-1" />
              Set
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsProvidingQuote(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsProvidingQuote(true)}
          >
            Provide Quote
          </Button>
        )
      )}
      
      {/* Completed Status */}
      {formula.status === 'completed' && (
        <span className="text-sm text-green-600 flex items-center">
          <Check className="h-4 w-4 mr-1" />
          Completed
        </span>
      )}

      {/* Dialogs */}
      <FormulaDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        formula={formula}
      />
      
      <FormulaReviewDialog
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        formula={formula}
        onReviewComplete={handleReviewComplete}
      />
    </div>
  );
};

export default FormulaActions;
