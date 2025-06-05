
import React from 'react';
import FormulaItemCard from './formula-item/FormulaItemCard';

interface FormulaItemProps {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  quoteAmount: number | null;
  onAcceptQuote: (id: string, quote: number) => void;
}

const FormulaItem: React.FC<FormulaItemProps> = (props) => {
  return <FormulaItemCard {...props} />;
};

export default FormulaItem;
