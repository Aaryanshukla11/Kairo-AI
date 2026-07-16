import React from 'react';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps): React.JSX.Element {
  return (
    <div className="message-content body">
      {content}
    </div>
  );
}
