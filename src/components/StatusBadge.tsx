
import React from 'react';
import { FormulaStatus } from '@/types/auth';

interface StatusBadgeProps {
  status: FormulaStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusLabel = (status: FormulaStatus): string => {
    switch (status) {
      case 'pending_review': return 'Pending Review';
      case 'quote_requested': return 'Quote Requested';
      case 'quote_provided': return 'Quote Ready';
      case 'paid': return 'Paid';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };
  
  const getStatusClass = (status: FormulaStatus): string => {
    switch (status) {
      case 'pending_review': return 'bg-gray-100 text-gray-800';
      case 'quote_requested': return 'bg-blue-100 text-blue-800';
      case 'quote_provided': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
