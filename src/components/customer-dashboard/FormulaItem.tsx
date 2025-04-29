
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import { FormulaStatus } from '@/types/auth';
import { FileText } from 'lucide-react';
import FormulaDetailsDialog from '@/components/formula-details/FormulaDetailsDialog';

interface FormulaItemProps {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  quoteAmount: number | null;
  onAcceptQuote: (id: string, quote: number) => void;
}

const FormulaItem: React.FC<FormulaItemProps> = ({
  id,
  filename,
  status,
  createdAt,
  quoteAmount,
  onAcceptQuote
}) => {
  const navigate = useNavigate();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formulaDetails, setFormulaDetails] = useState<any | null>(null);

  // Convert the string status to FormulaStatus for the StatusBadge
  const getFormulaStatus = (status: string): FormulaStatus => {
    switch(status) {
      case 'pending_review': return 'pending_review';
      case 'quote_requested': return 'quote_requested';
      case 'quote_provided': return 'quote_provided';
      case 'paid': return 'paid';
      case 'completed': return 'completed';
      default: return 'pending_review';
    }
  };

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
      // We no longer call onUpdate directly, the customer dashboard will refresh via React Query
    } catch (error: any) {
      toast.error(`Failed to request quote: ${error.message}`);
    }
  };

  const handlePayment = () => {
    if (quoteAmount) {
      onAcceptQuote(id, quoteAmount);
    } else {
      toast.error('Quote amount is not available');
    }
  };

  const handleViewDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('formulas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setFormulaDetails(data);
      setIsDetailsDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching formula details:', err);
      toast.error('Could not load formula details');
    }
  };

  return (
    <Card className="p-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate max-w-[200px]">{filename}</span>
          <StatusBadge status={getFormulaStatus(status)} />
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Submitted: {new Date(createdAt).toLocaleDateString()}
          {quoteAmount !== null && (
            <span className="ml-2 font-medium text-ra-blue">${quoteAmount}</span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleViewDetails}
        >
          <FileText className="h-4 w-4 mr-1" />
          View Details
        </Button>

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

      <FormulaDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        formula={formulaDetails}
      />
    </Card>
  );
};

export default FormulaItem;
