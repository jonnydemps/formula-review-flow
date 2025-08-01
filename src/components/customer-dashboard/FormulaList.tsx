
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
    return <SkeletonLoader variant="list" count={3} />;
  }

  if (formulas.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-md">
        <p className="text-gray-500">No formulas submitted yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload a formula to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      {formulas.map((formula) => (
        <FormulaItem
          key={formula.id}
          id={formula.id}
          filename={formula.original_filename}
          status={formula.status}
          createdAt={formula.created_at}
          quoteAmount={formula.quote_amount}
          onAcceptQuote={onAcceptQuote}
        />
      ))}
    </div>
  );
};

export default FormulaList;
