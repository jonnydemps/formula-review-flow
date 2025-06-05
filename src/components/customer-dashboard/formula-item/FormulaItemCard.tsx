
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import FormulaDetailsDialog from '@/components/formula-details/FormulaDetailsDialog';
import FormulaItemInfo from './FormulaItemInfo';
import FormulaItemActions from './FormulaItemActions';

interface FormulaItemCardProps {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  quoteAmount: number | null;
  onAcceptQuote: (id: string, quote: number) => void;
}

const FormulaItemCard: React.FC<FormulaItemCardProps> = ({
  id,
  filename,
  status,
  createdAt,
  quoteAmount,
  onAcceptQuote
}) => {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formulaDetails, setFormulaDetails] = useState<any | null>(null);

  const handleViewDetails = async () => {
    try {
      const { data: formulaData, error: formulaError } = await supabase
        .from('formulas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (formulaError) throw formulaError;
      
      setFormulaDetails(formulaData);
      setIsDetailsDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching formula details:', err);
      toast.error('Could not load formula details');
    }
  };

  return (
    <>
      <Card className="p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
        <FormulaItemInfo
          filename={filename}
          status={status}
          createdAt={createdAt}
          quoteAmount={quoteAmount}
        />
        
        <FormulaItemActions
          id={id}
          status={status}
          quoteAmount={quoteAmount}
          onViewDetails={handleViewDetails}
        />
      </Card>

      <FormulaDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        formula={formulaDetails}
      />
    </>
  );
};

export default FormulaItemCard;
