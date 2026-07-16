import React from 'react';

interface ExecutionToolbarProps {
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
}

export const ExecutionToolbar: React.FC<ExecutionToolbarProps> = ({
  onPause,
  onResume,
  onCancel,
  onRetry,
  disabled = true
}) => {
  return (
    <div className="execution-toolbar">
      <button className="execution-btn" disabled={disabled} onClick={onPause}>Pause</button>
      <button className="execution-btn" disabled={disabled} onClick={onResume}>Resume</button>
      <button className="execution-btn" disabled={disabled} onClick={onRetry}>Retry</button>
      <button className="execution-btn" disabled={disabled} onClick={onCancel}>Cancel</button>
    </div>
  );
};
