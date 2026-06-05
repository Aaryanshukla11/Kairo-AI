import React from "react";

/**
 * PromptPanel component holding the disabled textarea and dispatch send button.
 */
export function PromptPanel(): React.JSX.Element {
  return (
    <footer className="prompt-panel">
      <div className="prompt-textarea-wrapper">
        <textarea
          className="prompt-textarea"
          placeholder="Describe what you want to build..."
          disabled
        />
      </div>
      <div className="prompt-actions">
        <button className="prompt-send-button" disabled>
          <span>Send</span>
        </button>
      </div>
    </footer>
  );
}
export default PromptPanel;
