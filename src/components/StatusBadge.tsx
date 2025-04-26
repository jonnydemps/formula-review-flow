
import React from 'react';

export type FormulStatus = 'pending' | 'quote' | 'paid' | 'rejected';

interface StatusBadgeProps {
  status: FormulStatus;
}

const statusLabels: Record<FormulStatus, string> = {
  pending: 'Pending Review',
  quote: 'Quote Ready',
  paid: 'Paid',
  rejected: 'Rejected'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`status-badge status-${status}`}>
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
