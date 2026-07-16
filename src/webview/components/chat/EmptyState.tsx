import React from 'react';

export function EmptyState(): React.JSX.Element {
  return (
    <div className="chat-empty-state">
      <h2 className="chat-empty-title display">How can I help you?</h2>
    </div>
  );
}
