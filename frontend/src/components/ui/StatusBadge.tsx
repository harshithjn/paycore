export type Status = 'SUCCESS' | 'COMPLETED' | 'FAILED' | 'PROCESSING' | 'REFUNDED' | 'SETTLED' | 'PENDING' | 'CREATED' | 'INITIATED';

interface StatusBadgeProps {
  status: Status | string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusClass = (status: string) => {
    const normalized = status?.toUpperCase() || 'PENDING';
    switch (normalized) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'status-success';
      case 'FAILED':
        return 'status-failed';
      case 'PROCESSING':
        return 'status-processing';
      case 'REFUNDED':
        return 'status-refunded';
      case 'SETTLED':
        return 'status-settled';
      case 'PENDING':
      case 'CREATED':
      case 'INITIATED':
      default:
        return 'status-pending';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};
