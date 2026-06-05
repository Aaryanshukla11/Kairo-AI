import React from 'react';

export interface SendButtonProps {
  onSend: () => void;
  disabled: boolean;
}

export function SendButton({ onSend, disabled }: SendButtonProps): React.JSX.Element {
  return (
    <button 
      className="composer-send-button" 
      onClick={onSend} 
      disabled={disabled}
      aria-label="Send prompt"
      title="Send prompt"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  );
}
