import React from 'react';
import { ComposerTextarea } from './ComposerTextarea';
import { ComposerActions } from './ComposerActions';

export function PromptComposer(): React.JSX.Element {
  return (
    <div className="composer-panel">
      <div className="composer-wrapper">
        <ComposerTextarea />
        <ComposerActions />
      </div>
    </div>
  );
}
