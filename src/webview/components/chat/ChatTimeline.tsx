import React, { useEffect, useRef } from 'react';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { useAppContext } from '../../context/AppContext';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { SystemMessage } from './SystemMessage';
import { messageBus } from '../../services/messageBus';
import { MessageType } from '../../../common/protocol';
import { PlanProposalMessage } from './PlanProposalMessage';

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

    const handleTimelineInit = (msg: any) => {
      if (msg.type === MessageType.TIMELINE_INIT && msg.payload?.timeline) {
        const { timeline } = msg.payload;
        setChatState((prev) => {
          const updatedMessages = prev.messages.map((m) => {
            if (m.role === 'PLAN_PROPOSAL' && m.plan && m.plan.id === timeline.planId) {
              return { ...m, timeline };
            }
            return m;
          });
          return { ...prev, messages: updatedMessages };
        });
      }
    };

    const handleTimelineUpdate = (msg: any) => {
      if (msg.type === MessageType.TIMELINE_UPDATE && msg.payload?.timeline) {
        const { timeline } = msg.payload;
        setChatState((prev) => {
          const updatedMessages = prev.messages.map((m) => {
            if (m.role === 'PLAN_PROPOSAL' && m.plan && m.plan.id === timeline.planId) {
              return { ...m, timeline };
            }
            return m;
          });
          return { ...prev, messages: updatedMessages };
        });
      }
    };

    const handleExecutionUpdate = (msg: any) => {
      if (msg.type === MessageType.EXECUTION_UPDATE && msg.payload?.progress) {
        const { progress } = msg.payload;
        setChatState((prev) => {
          const updatedMessages = prev.messages.map((m) => {
            if (m.role === 'PLAN_PROPOSAL' && m.timeline) {
              return { ...m, executionProgress: progress };
            }
            return m;
          });
          return { ...prev, messages: updatedMessages };
        });
      }
    };

    messageBus.subscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
    messageBus.subscribe(MessageType.TIMELINE_INIT, handleTimelineInit);
    messageBus.subscribe(MessageType.TIMELINE_UPDATE, handleTimelineUpdate);
    messageBus.subscribe(MessageType.EXECUTION_UPDATE, handleExecutionUpdate);

    return () => {
      messageBus.unsubscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
      messageBus.unsubscribe(MessageType.TIMELINE_INIT, handleTimelineInit);
      messageBus.unsubscribe(MessageType.TIMELINE_UPDATE, handleTimelineUpdate);
      messageBus.unsubscribe(MessageType.EXECUTION_UPDATE, handleExecutionUpdate);
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
            if (msg.role === 'PLAN_PROPOSAL') {
              return (
                <PlanProposalMessage 
                  key={msg.id} 
                  plan={msg.plan} 
                  approval={msg.approval} 
                  timeline={msg.timeline}
                  executionProgress={msg.executionProgress}
                />
              );
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
