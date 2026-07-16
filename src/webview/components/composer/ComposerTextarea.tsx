import React from 'react';

export function ComposerTextarea(): React.JSX.Element {
  return (
    <textarea
      className="composer-textarea body"
      placeholder="Describe what you want to build..."
      disabled
      aria-label="Prompt input"
    />
  );
}
