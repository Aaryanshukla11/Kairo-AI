import React from 'react';

export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'WAITING' | 'CANCELLED';

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
}

export const ExecutionStatusBadge: React.FC<ExecutionStatusBadgeProps> = ({ status }) => {
  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'RUNNING': return '🔄';
      case 'SUCCESS': return '✓';
      case 'FAILED': return '✗';
      case 'SKIPPED': return '⏭';
      case 'WAITING': return '⏸';
      case 'CANCELLED': return '⊘';
      default: return '•';
    }
  };

  const getStatusClass = (status: ExecutionStatus) => {
    return `status-${status.toLowerCase()}`;
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
