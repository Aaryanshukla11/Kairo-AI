import React from 'react';
import { SendButton } from './SendButton';

export function PromptComposer(): React.JSX.Element {
  return (
    <div className="chat-prompt-composer">
      <div className="chat-prompt-wrapper">
        <textarea
          className="chat-prompt-textarea body"
          placeholder="Describe what you want to build..."
          disabled
          aria-label="Prompt input"
          rows={3}
        />
        <div className="chat-prompt-actions">
          <SendButton />
        </div>
      </div>
    </div>
  );
}
