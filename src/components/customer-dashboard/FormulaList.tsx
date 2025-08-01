
import { Card } from '@/components/ui/card';
import FormulaItem from './FormulaItem';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Formula } from '@/types/formula';

interface FormulaListProps {
  formulas: Formula[];
  isLoading: boolean;
  onAcceptQuote: (id: string, amount: number) => void;
}

const FormulaList: React.FC<FormulaListProps> = ({ 
  formulas, 
  isLoading, 
  onAcceptQuote 
}) => {
  if (isLoading) {
    return (
      <div role="status" aria-label="Loading formulas">
        <SkeletonLoader variant="list" count={3} />
      </div>
    );
  }

  if (formulas.length === 0) {
    return (
      <div 
        className="p-6 md:p-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/30"
        role="status"
        aria-label="No formulas found"
      >
        <p className="text-muted-foreground font-medium">No formulas submitted yet</p>
        <p className="text-sm text-muted-foreground/80 mt-1">
          Upload a formula to get started with your regulatory review process
        </p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-3 md:space-y-4"
      role="list"
      aria-label={`${formulas.length} formula${formulas.length !== 1 ? 's' : ''}`}
    >
      {formulas.map((formula) => (
        <div key={formula.id} role="listitem">
          <FormulaItem
            id={formula.id}
            filename={formula.original_filename}
            status={formula.status}
            createdAt={formula.created_at}
            quoteAmount={formula.quote_amount}
            onAcceptQuote={onAcceptQuote}
          />
        </div>
      ))}
    </div>
  );
};

export default FormulaList;
