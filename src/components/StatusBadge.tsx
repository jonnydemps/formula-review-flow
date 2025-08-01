
import React from 'react';
import { FormulaStatus } from '@/types/auth';

interface StatusBadgeProps {
  status: FormulaStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusLabel = (status: FormulaStatus | string): string => {
    switch (status) {
      case 'pending_review': return 'Pending Review';
      case 'quote_requested': return 'Quote Requested';
      case 'quote_provided': return 'Quote Ready';
      case 'paid': return 'Paid';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };
  
  const getStatusClass = (status: FormulaStatus | string): string => {
    switch (status) {
      case 'pending_review': return 'bg-status-pending text-status-pending-foreground';
      case 'quote_requested': return 'bg-status-quote text-status-quote-foreground';
      case 'quote_provided': return 'bg-status-quote text-status-quote-foreground';
      case 'paid': return 'bg-status-paid text-status-paid-foreground';
      case 'completed': return 'bg-status-completed text-status-completed-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
