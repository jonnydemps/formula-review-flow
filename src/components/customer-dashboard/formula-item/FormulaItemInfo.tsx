
import React from 'react';
import StatusBadge from '@/components/StatusBadge';
import { FormulaStatus } from '@/types/auth';

interface FormulaItemInfoProps {
  filename: string;
  status: string;
  createdAt: string;
  quoteAmount: number | null;
}

const FormulaItemInfo: React.FC<FormulaItemInfoProps> = ({
  filename,
  status,
  createdAt,
  quoteAmount
}) => {
  const getFormulaStatus = (status: string): FormulaStatus => {
    switch(status) {
      case 'pending_review': return 'pending_review';
      case 'quote_requested': return 'quote_requested';
      case 'quote_provided': return 'quote_provided';
      case 'paid': return 'paid';
      case 'in_review_draft': return 'paid'; // Show as 'paid' to customer
      case 'review_completed': return 'paid'; // Show as 'paid' to customer
      case 'sent_to_client': return 'completed'; // Show as 'completed' when sent to client
      case 'completed': return 'completed';
      default: return 'pending_review';
    }
  };

  const getCustomerStatusLabel = (status: string): string => {
    switch(status) {
      case 'in_review_draft':
      case 'review_completed':
        return 'Review in Progress';
      case 'sent_to_client':
        return 'Review Complete';
      default:
        return '';
    }
  };

  const customLabel = getCustomerStatusLabel(status);

  return (
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
        {customLabel && (
          <span className="ml-2 text-blue-600 font-medium">{customLabel}</span>
        )}
      </div>
    </div>
  );
};

export default FormulaItemInfo;
