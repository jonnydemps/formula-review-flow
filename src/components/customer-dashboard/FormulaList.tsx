
import React from 'react';
import FormulaItem from './FormulaItem';

interface Formula {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  quote_amount: number | null;
}

interface FormulaListProps {
  formulas: any[];
  isLoading: boolean;
  onAcceptQuote: (id: string, quote: number) => void;
}

const FormulaList: React.FC<FormulaListProps> = ({ formulas, isLoading, onAcceptQuote }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading your formulas...</p>
      </div>
    );
  }

  if (formulas.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md">
        <p>You haven't uploaded any formulas yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {formulas.map(formula => (
        <FormulaItem
          key={formula.id}
          id={formula.id}
          filename={formula.original_filename || formula.name}
          status={formula.status}
          createdAt={formula.created_at || formula.uploadDate}
          quoteAmount={formula.quote_amount || formula.quote}
          onAcceptQuote={onAcceptQuote}
        />
      ))}
    </div>
  );
};

export default FormulaList;
