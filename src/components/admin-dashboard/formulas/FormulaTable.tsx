
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { FormulaStatus } from '@/types/auth';

interface Formula {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  quote_amount: number | null;
  quote_requested_at: string | null;
  customer_id: string;
  customer?: {
    name: string;
    email: string;
  };
}

interface FormulaTableProps {
  formulas: Formula[];
  onProvideQuote: (id: string, amount: number) => Promise<void>;
}

const FormulaTable: React.FC<FormulaTableProps> = ({ formulas, onProvideQuote }) => {
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Quote</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formulas.map((formula) => (
            <TableRow key={formula.id}>
              <TableCell>{(formula.customer?.name) || 'Unknown User'}</TableCell>
              <TableCell className="max-w-[200px] truncate">{formula.original_filename}</TableCell>
              <TableCell>
                <StatusBadge status={getFormulaStatus(formula.status)} />
              </TableCell>
              <TableCell>
                {formula.created_at ? new Date(formula.created_at).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell>
                {formula.quote_amount ? `$${formula.quote_amount}` : '-'}
              </TableCell>
              <TableCell>
                <FormulaActions
                  formula={formula}
                  onProvideQuote={onProvideQuote}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FormulaTable;
