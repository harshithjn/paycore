import React from 'react';
import { cn } from '../../utils/cn';

export type Status = 'success' | 'pending' | 'failed' | 'processing' | 'created' | 'refunded' | 'settled' | 'SUCCESS' | 'FAILED' | 'PROCESSING' | 'CREATED' | 'INITIATED';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  success: { label: 'Success', className: 'status-success' },
  pending: { label: 'Pending', className: 'status-pending' },
  failed: { label: 'Failed', className: 'status-failed' },
  processing: { label: 'Processing', className: 'status-processing' },
  created: { label: 'Created', className: 'status-pending' },
  refunded: { label: 'Refunded', className: 'status-success' },
  settled: { label: 'Settled', className: 'status-success' },
  // New uppercase statuses
  SUCCESS: { label: 'Success', className: 'status-success' },
  FAILED: { label: 'Failed', className: 'status-failed' },
  PROCESSING: { label: 'Processing', className: 'status-processing' },
  CREATED: { label: 'Created', className: 'status-pending' },
  INITIATED: { label: 'Initiated', className: 'status-processing' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
};