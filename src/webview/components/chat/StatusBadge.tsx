import React from 'react';

interface StatusBadgeProps {
  label: string;
  status: 'ready' | 'working' | 'error' | 'offline';
}

export function StatusBadge({ label, status }: StatusBadgeProps): React.JSX.Element {
  return (
    <div className={`chat-status-badge status-${status}`}>
      <div className="chat-status-dot" />
      <span className="chat-status-label caption">{label}</span>
    </div>
  );
}
