import React from 'react';

interface ExecutionProgressProps {
  totalSteps: number;
  completedSteps: number;
}

export const ExecutionProgress: React.FC<ExecutionProgressProps> = ({ totalSteps, completedSteps }) => {
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="execution-progress-container">
      <div className="execution-progress-bar-bg">
        <div 
          className="execution-progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="execution-progress-stats">
        <span>{completedSteps} of {totalSteps} steps completed</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};
