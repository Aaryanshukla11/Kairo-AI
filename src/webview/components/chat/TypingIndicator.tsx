import React from 'react';

export function TypingIndicator(): React.JSX.Element {
  return (
    <div className="typing-indicator" aria-hidden="true" style={{ display: 'none' }}>
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
    </div>
  );
}
