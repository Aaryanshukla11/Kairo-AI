import React from 'react';
import { MessageAvatar } from './MessageAvatar';
import { MessageContent } from './MessageContent';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps): React.JSX.Element {
  return (
    <div className={`message-bubble-wrapper message-${role}`}>
      <MessageAvatar role={role} />
      <div className="message-bubble-body">
        <MessageContent content={content} />
      </div>
    </div>
  );
}
