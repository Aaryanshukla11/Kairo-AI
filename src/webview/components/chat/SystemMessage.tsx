import React from 'react';
import { MessageBubble } from './MessageBubble';

interface SystemMessageProps {
  content: string;
}

export function SystemMessage({ content }: SystemMessageProps): React.JSX.Element {
  return <MessageBubble role="system" content={content} />;
}
