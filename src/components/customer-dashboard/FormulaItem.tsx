
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';

interface FormulaItemProps {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  quoteAmount: number | null;
  onUpdate: () => void;
}

const FormulaItem: React.FC<FormulaItemProps> = ({
  id,
  filename,
  status,
  createdAt,
  quoteAmount,
  onUpdate
}) => {
  const navigate = useNavigate();

  const requestQuote = async () => {
    try {
      const { error } = await supabase
        .from('formulas')
        .update({
          status: 'quote_requested',
          quote_requested_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Quote requested successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(`Failed to request quote: ${error.message}`);
    }
  };

  const handlePayment = () => {
    navigate('/payment', { state: { formulaId: id, amount: quoteAmount } });
  };

  return (
    <Card className="p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate max-w-[200px]">{filename}</span>
          <StatusBadge status={status} />
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Submitted: {new Date(createdAt).toLocaleDateString()}
          {quoteAmount !== null && (
            <span className="ml-2 font-medium text-ra-blue">${quoteAmount}</span>
          )}
        </div>
      </div>
      
      <div>
        {status === 'pending_review' && (
          <Button size="sm" onClick={requestQuote}>Request Quote</Button>
        )}
        
        {status === 'quote_requested' && (
          <span className="text-sm text-gray-500 italic">Awaiting quote from admin</span>
        )}
        
        {status === 'quote_provided' && (
          <Button size="sm" onClick={handlePayment}>
            Pay ${quoteAmount}
          </Button>
        )}
        
        {status === 'paid' && (
          <span className="text-sm text-green-500 font-medium">Paid - Review in progress</span>
        )}
        
        {status === 'completed' && (
          <Button size="sm" variant="outline">
            Download Report
          </Button>
        )}
      </div>
    </Card>
  );
};

export default FormulaItem;
