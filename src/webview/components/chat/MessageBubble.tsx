import React from 'react';
import { MessageContent } from './MessageContent';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps): React.JSX.Element {
  return (
    <div className={`message-bubble-wrapper message-${role}`} style={styles.wrapper}>
      <div className="message-bubble-body" style={role === 'user' ? styles.userBody : styles.assistantBody}>
        <MessageContent content={content} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    width: '100%',
    margin: '6px 0',
    padding: '0'
  },
  userBody: {
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    padding: '10px 14px',
    borderRadius: '12px',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box'
  },
  assistantBody: {
    padding: '4px 0',
    maxWidth: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  }
};
