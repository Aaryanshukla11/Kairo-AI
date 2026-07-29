import React from 'react';

export type ExecutionStatus =
  | 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'WAITING' | 'CANCELLED'
  | 'Waiting' | 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Skipped';

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
}

export const ExecutionStatusBadge: React.FC<ExecutionStatusBadgeProps> = ({ status }) => {
  const getStatusIcon = (stat: ExecutionStatus) => {
    const s = stat.toUpperCase();
    switch (s) {
      case 'PENDING': return '⏳';
      case 'QUEUED': return '📥';
      case 'RUNNING': return '🔄';
      case 'SUCCESS':
      case 'COMPLETED': return '✓';
      case 'FAILED': return '✗';
      case 'SKIPPED': return '⏭';
      case 'WAITING': return '⏸';
      case 'CANCELLED': return '⊘';
      default: return '•';
    }
  };

  const getStatusClass = (stat: ExecutionStatus) => {
    const s = stat.toUpperCase();
    if (s === 'COMPLETED') return 'status-success';
    if (s === 'QUEUED') return 'status-pending';
    return `status-${s.toLowerCase()}`;
  };

  return (
    <div className={`execution-step-indicator`} title={status}>
      <div className={`execution-step-icon ${getStatusClass(status)}`}>
        {getStatusIcon(status)}
      </div>
      <div className="execution-step-line"></div>
    </div>
  );
};
