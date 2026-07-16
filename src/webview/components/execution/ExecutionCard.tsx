import React from 'react';
import { ExecutionTimeline } from './ExecutionTimeline';
import { ExecutionSummary } from './ExecutionSummary';
import { ExecutionProgress } from './ExecutionProgress';
import { ExecutionToolbar } from './ExecutionToolbar';
import { ExecutionEmptyState } from './ExecutionEmptyState';
import { ExecutionStepData } from './ExecutionStep';
import '../../styles/execution.css';

export interface ExecutionCardProps {
  planName?: string;
  riskLevel?: string;
  estimatedDuration?: number;
  approvalStatus?: string;
  executionStatus?: string;
  totalSteps?: number;
  completedSteps?: number;
  steps?: ExecutionStepData[];
}

export const ExecutionCard: React.FC<ExecutionCardProps> = ({
  planName,
  riskLevel,
  estimatedDuration,
  approvalStatus,
  executionStatus,
  totalSteps,
  completedSteps,
  steps
}) => {
  if (!planName) {
    return <ExecutionEmptyState />;
  }

  return (
    <div className="execution-container">
      <div className="execution-card">
        <ExecutionSummary 
          planName={planName}
          riskLevel={riskLevel || 'UNKNOWN'}
          estimatedDuration={estimatedDuration || 0}
          approvalStatus={approvalStatus || 'PENDING'}
          executionStatus={executionStatus || 'IDLE'}
        />
        <ExecutionProgress 
          totalSteps={totalSteps || 0} 
          completedSteps={completedSteps || 0} 
        />
        <ExecutionTimeline steps={steps || []} />
        <ExecutionToolbar disabled={true} />
      </div>
    </div>
  );
};
