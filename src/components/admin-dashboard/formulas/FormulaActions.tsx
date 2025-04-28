
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormulaStatus } from '@/types/auth';

interface Formula {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  quote_amount: number | null;
  quote_requested_at: string | null;
}

interface FormulaActionsProps {
  formula: Formula;
  onProvideQuote: (id: string, amount: number) => Promise<void>;
}

const FormulaActions: React.FC<FormulaActionsProps> = ({
  formula,
  onProvideQuote,
}) => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState(formula.quote_amount || 100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProvideQuote = async () => {
    if (quoteAmount <= 0) {
      toast.error('Please enter a valid quote amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onProvideQuote(formula.id, quoteAmount);
      setIsQuoteDialogOpen(false);
      toast.success('Quote provided successfully');
    } catch (error) {
      console.error('Error providing quote:', error);
      toast.error('Failed to provide quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProvideQuote = formula.status === 'pending_review' || formula.status === 'quote_requested';
  const canDownloadReport = formula.status === 'completed';

  const handleDownload = () => {
    toast.info('Downloading report...');
    // Implement download functionality
  };

  return (
    <div className="flex space-x-2">
      {canProvideQuote && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setIsQuoteDialogOpen(true)}
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Provide Quote
        </Button>
      )}

      {canDownloadReport && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download Report
        </Button>
      )}

      <Button 
        size="sm" 
        variant="outline"
        onClick={() => toast.info("Formula details view coming soon")}
      >
        <FileText className="h-4 w-4 mr-1" />
        View Details
      </Button>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Quote Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={quoteAmount}
                onChange={(e) => setQuoteAmount(Number(e.target.value))}
                min="1"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Formula: {formula.original_filename}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuoteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProvideQuote}
              disabled={isSubmitting || quoteAmount <= 0}
            >
              {isSubmitting ? 'Processing...' : 'Submit Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormulaActions;
