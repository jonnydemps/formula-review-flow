
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import FormulaActions from './FormulaActions';
import StatusBadge from '@/components/StatusBadge';
import EnhancedFormulaReviewDialog from './EnhancedFormulaReviewDialog';

interface FormulaTableProps {
  formulas: any[];
  onProvideQuote: (id: string, amount: number) => void;
  onRefresh?: () => void;
}

const FormulaTable: React.FC<FormulaTableProps> = ({ formulas, onProvideQuote, onRefresh }) => {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);

  const handleReview = (formula: any) => {
    console.log('Opening enhanced review dialog for formula:', formula.id);
    setSelectedFormula(formula);
    setReviewDialogOpen(true);
  };

  const handleReviewComplete = () => {
    console.log('Review completed, refreshing data');
    if (onRefresh) {
      onRefresh();
    }
    setReviewDialogOpen(false);
    setSelectedFormula(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formula</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Customer Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Quote</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formulas.map((formula) => (
              <TableRow key={formula.id} className="hover:bg-muted/50">
                <TableCell className="font-medium truncate max-w-[200px]">
                  {formula.original_filename || 'Unnamed Formula'}
                </TableCell>
                <TableCell>
                  <StatusBadge status={formula.status} />
                </TableCell>
                <TableCell className="truncate max-w-[150px]">
                  {formula.profiles?.name || 'Unknown'}
                </TableCell>
                <TableCell className="truncate max-w-[200px]">
                  {formula.profiles?.email || formula.customer_id || 'Unknown'}
                </TableCell>
                <TableCell>
                  {new Date(formula.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {formula.quote_amount ? `$${formula.quote_amount}` : '–'}
                </TableCell>
                <TableCell>
                  <FormulaActions 
                    formula={formula} 
                    onProvideQuote={onProvideQuote} 
                    onRefresh={onRefresh}
                    onReview={() => handleReview(formula)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Enhanced Formula Review Dialog */}
      <EnhancedFormulaReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        formula={selectedFormula}
        onReviewComplete={handleReviewComplete}
      />
    </>
  );
};

export default FormulaTable;
