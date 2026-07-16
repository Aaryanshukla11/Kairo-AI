import React from 'react';
import { ComposerToolbar } from './ComposerToolbar';
import { SendButton } from './SendButton';

export function ComposerActions(): React.JSX.Element {
  return (
    <div className="composer-actions-container">
      <ComposerToolbar />
      <SendButton />
    </div>
  );
}
