import React from 'react';
import { ExecutionStep, ExecutionStepData } from './ExecutionStep';

interface ExecutionTimelineProps {
  steps: ExecutionStepData[];
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div className="execution-timeline">
      {steps.map(step => (
        <ExecutionStep key={step.id} step={step} />
      ))}
    </div>
  );
};
