import React from 'react';
import { ComposerToolbar } from './ComposerToolbar';
import { SendButton } from './SendButton';

export interface ComposerActionsProps {
  onSend: () => void;
  disabled: boolean;
}

export function ComposerActions({ onSend, disabled }: ComposerActionsProps): React.JSX.Element {
  return (
    <div className="composer-actions-container">
      <ComposerToolbar />
      <SendButton onSend={onSend} disabled={disabled} />
    </div>
  );
}
