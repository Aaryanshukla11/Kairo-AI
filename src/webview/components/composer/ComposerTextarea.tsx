import React from 'react';

export interface ComposerTextareaProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export function ComposerTextarea({ value, onChange, onSend, disabled }: ComposerTextareaProps): React.JSX.Element {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <textarea
      className="composer-textarea body"
      placeholder="Describe what you want to build..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="Prompt input"
      rows={1}
    />
  );
}
