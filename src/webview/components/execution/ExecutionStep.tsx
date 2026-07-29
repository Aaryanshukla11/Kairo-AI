import React from 'react';
import { ExecutionStatusBadge, ExecutionStatus } from './ExecutionStatusBadge';

export interface ExecutionStepData {
  id: string;
  title: string;
  description: string;
  status: ExecutionStatus;
  stepNumber?: number;
  estimatedTime?: string;
  icon?: string;
  duration?: number;
  logs?: string;
}

interface ExecutionStepProps {
  step: ExecutionStepData;
}

export const ExecutionStep: React.FC<ExecutionStepProps> = ({ step }) => {
  return (
    <div className="execution-step">
      <ExecutionStatusBadge status={step.status} />
      
      <div className="execution-step-content">
        <div className="execution-step-header">
          <span className="execution-step-title">
            {step.stepNumber ? `${step.stepNumber}. ` : ''}{step.title}
          </span>
          {step.estimatedTime && (
            <span className="execution-step-duration">Est: {step.estimatedTime}</span>
          )}
          {step.duration !== undefined && (
            <span className="execution-step-duration">({step.duration}ms)</span>
          )}
        </div>
        
        <div className="execution-step-desc">
          {step.description}
        </div>
        
        {step.logs && (
          <div className="execution-step-logs">
            {step.logs}
          </div>
        )}
      </div>
    </div>
  );
};
