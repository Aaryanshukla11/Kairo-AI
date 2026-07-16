import React, { useEffect, useRef } from 'react';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { useAppContext } from '../../context/AppContext';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { SystemMessage } from './SystemMessage';
import { messageBus } from '../../services/messageBus';
import { MessageType } from '../../../common/protocol';

export function ChatTimeline(): React.JSX.Element {
  const { chatState, setChatState } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping]);

  useEffect(() => {
    const handleMockResponse = (msg: any) => {
      if (msg.type === MessageType.MOCK_RESPONSE && msg.payload) {
        setChatState((prev) => {
          // Verify it's not a duplicate
          const exists = prev.messages.find(m => m.id === msg.payload.id);
          if (exists) return prev;

          return {
            ...prev,
            messages: [...prev.messages, msg.payload],
            isTyping: false
          };
        });
      }
    };

    messageBus.subscribe(MessageType.MOCK_RESPONSE, handleMockResponse);

    return () => {
      messageBus.unsubscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
    };
  }, [setChatState]);

  return (
    <div className="chat-timeline">
      {chatState.messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="chat-messages-container">
          {chatState.messages.map((msg) => {
            if (msg.role === 'USER') {
              return <UserMessage key={msg.id} content={msg.content} />;
            }
            if (msg.role === 'ASSISTANT') {
              return <AssistantMessage key={msg.id} content={msg.content} />;
            }
            if (msg.role === 'SYSTEM' || msg.role === 'ERROR') {
              return <SystemMessage key={msg.id} content={msg.content} />;
            }
            return null;
          })}
          {chatState.isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
