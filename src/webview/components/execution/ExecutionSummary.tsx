import React from 'react';

interface ExecutionSummaryProps {
  planName: string;
  riskLevel: string;
  estimatedDuration: number;
  approvalStatus: string;
  executionStatus: string;
}

export const ExecutionSummary: React.FC<ExecutionSummaryProps> = ({
  planName,
  riskLevel,
  estimatedDuration,
  approvalStatus,
  executionStatus
}) => {
  return (
    <div className="execution-summary">
      <div className="execution-summary-header">
        <span className="execution-summary-title">{planName}</span>
      </div>
      <div className="execution-summary-meta">
        <span>Risk: {riskLevel}</span>
        <span>Est: {estimatedDuration}ms</span>
        <span>Auth: {approvalStatus}</span>
        <span>Status: {executionStatus}</span>
      </div>
    </div>
  );
};
