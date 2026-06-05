import React from 'react';
import { MessageBubble } from './MessageBubble';

interface AssistantMessageProps {
  content: string;
}

export function AssistantMessage({ content }: AssistantMessageProps): React.JSX.Element {
  return <MessageBubble role="assistant" content={content} />;
}
