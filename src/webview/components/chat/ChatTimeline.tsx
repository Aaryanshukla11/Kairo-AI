import React from 'react';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';

interface ChatTimelineProps {
  messages?: any[];
}

export function ChatTimeline({ messages = [] }: ChatTimelineProps): React.JSX.Element {
  return (
    <div className="chat-timeline">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="chat-messages-container">
          {/* Future message rendering loop goes here */}
        </div>
      )}
      <TypingIndicator />
    </div>
  );
}
