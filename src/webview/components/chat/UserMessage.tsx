import React from 'react';
import { MessageBubble } from './MessageBubble';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps): React.JSX.Element {
  return <MessageBubble role="user" content={content} />;
}
