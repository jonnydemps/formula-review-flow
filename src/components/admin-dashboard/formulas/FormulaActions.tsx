
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface Formula {
  id: string;
  status: string;
}

interface FormulaActionsProps {
  formula: Formula;
  onProvideQuote: (id: string, amount: number) => Promise<void>;
}

const FormulaActions: React.FC<FormulaActionsProps> = ({ formula, onProvideQuote }) => {
  return (
    <>
      {formula.status === 'quote_requested' && (
        <Button 
          size="sm" 
          onClick={() => onProvideQuote(formula.id, 150)}
        >
          Provide Quote ($150)
        </Button>
      )}
      {formula.status === 'paid' && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => toast.info("Upload report functionality coming soon")}
        >
          Upload Report
        </Button>
      )}
      {formula.status === 'completed' && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => toast.info("Download report functionality coming soon")}
        >
          <Download className="h-4 w-4 mr-1" /> Report
        </Button>
      )}
    </>
  );
};

export default FormulaActions;
