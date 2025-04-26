
import React from 'react';
import { Formula } from '@/services/formulaService';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface FormulaListProps {
  formulas: Formula[];
  isLoading: boolean;
  onAcceptQuote: (id: string, quote: number) => void;
}

const FormulaList: React.FC<FormulaListProps> = ({
  formulas,
  isLoading,
  onAcceptQuote,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading your formulas...</p>
      </div>
    );
  }

  if (formulas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>You haven't uploaded any formulas yet</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Formula Name</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {formulas.map((formula) => (
          <TableRow key={formula.id}>
            <TableCell>{formula.name}</TableCell>
            <TableCell>{formula.uploadDate}</TableCell>
            <TableCell>
              <StatusBadge status={formula.status} />
            </TableCell>
            <TableCell className="text-right">
              {formula.status === 'quote' && formula.quote && (
                <Button 
                  onClick={() => onAcceptQuote(formula.id, formula.quote!)}
                  size="sm"
                >
                  <DollarSign className="mr-1 h-4 w-4" />
                  Pay ${formula.quote}
                </Button>
              )}
              
              {formula.status === 'paid' && (
                <Button variant="outline" size="sm">
                  Report in Progress
                </Button>
              )}

              {formula.status === 'completed' && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      toast.success('Downloading report...');
                    }}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download Report
                  </a>
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FormulaList;
