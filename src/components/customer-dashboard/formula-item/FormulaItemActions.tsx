
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';

interface FormulaItemActionsProps {
  id: string;
  status: string;
  quoteAmount: number | null;
  onViewDetails: () => void;
}

const FormulaItemActions: React.FC<FormulaItemActionsProps> = ({
  id,
  status,
  quoteAmount,
  onViewDetails
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
    } catch (error: any) {
      toast.error(`Failed to request quote: ${error.message}`);
    }
  };

  const handlePayment = () => {
    if (quoteAmount) {
      navigate('/payment', { 
        state: { 
          formulaId: id, 
          amount: quoteAmount 
        } 
      });
    } else {
      toast.error('Quote amount is not available');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('report_url')
        .eq('formula_id', id)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data?.report_url) {
        toast.success('Downloading report...');
        
        setTimeout(() => {
          toast.info('This is a simulated download. In production, this would download a real PDF report.');
        }, 2000);
      } else {
        toast.error('Report not found');
      }
    } catch (err: any) {
      console.error('Error downloading report:', err);
      toast.error('Could not download report');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={onViewDetails}
        className="hover:bg-gray-100"
      >
        <FileText className="h-4 w-4 mr-1" />
        View Details
      </Button>

      {status === 'pending_review' && (
        <Button 
          size="sm" 
          onClick={requestQuote}
          className="bg-ra-blue hover:bg-ra-blue-dark"
        >
          Request Quote
        </Button>
      )}
      
      {status === 'quote_requested' && (
        <span className="text-sm text-gray-500 italic">Awaiting quote from admin</span>
      )}
      
      {status === 'quote_provided' && (
        <Button 
          size="sm" 
          onClick={handlePayment}
          className="bg-green-600 hover:bg-green-700"
        >
          Pay ${quoteAmount}
        </Button>
      )}
      
      {(status === 'paid' || status === 'in_review_draft' || status === 'review_completed') && (
        <span className="text-sm text-blue-600 font-medium">Review in progress</span>
      )}
      
      {status === 'sent_to_client' && (
        <Button 
          size="sm" 
          onClick={handleDownloadReport}
          className="bg-ra-blue hover:bg-ra-blue-dark"
        >
          <Download className="h-4 w-4 mr-1" />
          Download Report
        </Button>
      )}
    </div>
  );
};

export default FormulaItemActions;
