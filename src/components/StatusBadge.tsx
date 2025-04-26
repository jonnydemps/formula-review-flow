
import React from 'react';

export type FormulStatus = 'pending' | 'quote' | 'paid' | 'rejected' | 'completed';

interface StatusBadgeProps {
  status: FormulStatus;
}

const statusLabels: Record<FormulStatus, string> = {
  pending: 'Pending Review',
  quote: 'Quote Ready',
  paid: 'Paid',
  rejected: 'Rejected',
  completed: 'Completed'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`status-badge status-${status}`}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
