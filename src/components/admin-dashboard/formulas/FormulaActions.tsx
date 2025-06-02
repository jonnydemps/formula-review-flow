
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, DollarSign, Trash2 } from 'lucide-react';
import { deleteFormula } from '@/services/formulaService';
import { toast } from 'sonner';

interface FormulaActionsProps {
  formula: any;
  onProvideQuote: (id: string, amount: number) => void;
  onRefresh?: () => void;
  onReview?: () => void;
}

const FormulaActions: React.FC<FormulaActionsProps> = ({ 
  formula, 
  onProvideQuote, 
  onRefresh,
  onReview 
}) => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleQuoteSubmit = () => {
    const amount = Number(quoteAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    onProvideQuote(formula.id, amount);
    setIsQuoteDialogOpen(false);
    setQuoteAmount('');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteFormula(formula.id, formula.file_path);
      toast.success('Formula deleted successfully');
      setIsDeleteDialogOpen(false);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      toast.error(`Failed to delete formula: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onReview}>
        <FileText className="h-4 w-4 mr-1" />
        Review
      </Button>
      
      {formula.status === 'quote_requested' && (
        <Button size="sm" onClick={() => setIsQuoteDialogOpen(true)}>
          <DollarSign className="h-4 w-4 mr-1" />
          Quote
        </Button>
      )}

      <Button size="sm" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>
      
      {/* Quote Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Quote</DialogTitle>
            <DialogDescription>
              Enter the quote amount for this formula review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <span>$</span>
              <Input 
                type="number" 
                placeholder="Amount" 
                value={quoteAmount} 
                onChange={(e) => setQuoteAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleQuoteSubmit}>Submit Quote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Formula</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this formula? This action cannot be undone.
              All associated files and review data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormulaActions;
