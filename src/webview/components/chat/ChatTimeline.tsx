import React, { useEffect, useRef, useState } from 'react';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { useAppContext } from '../../context/AppContext';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { SystemMessage } from './SystemMessage';
import { messageBus } from '../../services/messageBus';
import { MessageType, IExecutionEventPayload } from '../../../common/protocol';
import { PlanProposalMessage } from './PlanProposalMessage';
import { PipelineStatusBubble, PipelineStatusEntry } from './PipelineStatusBubble';
import { LiveExecutionTimeline } from './LiveExecutionTimeline';

export function ChatTimeline(): React.JSX.Element {
  const { chatState, setChatState } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pipelineEntries, setPipelineEntries] = useState<PipelineStatusEntry[]>([]);
  const [executionEvents, setExecutionEvents] = useState<IExecutionEventPayload[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping, pipelineEntries, executionEvents]);

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

    const handlePipelineStatus = (msg: any) => {
      if (msg.type === MessageType.PIPELINE_STATUS && msg.payload) {
        const entry: PipelineStatusEntry = {
          stage: msg.payload.stage,
          detail: msg.payload.detail,
          status: msg.payload.status,
          timestamp: msg.payload.timestamp || Date.now()
        };
        setPipelineEntries(prev => {
          // Update existing stage entry if same stage or append new
          const existingIdx = prev.findIndex(e => e.stage === entry.stage);
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = entry;
            return updated;
          }
          return [...prev, entry];
        });
      }
    };

    const handleExecutionEvent = (msg: any) => {
      if (msg.type === MessageType.EXECUTION_EVENT && msg.payload) {
        const eventItem = msg.payload as IExecutionEventPayload;
        setExecutionEvents(prev => {
          const existingIdx = prev.findIndex(e => e.id === eventItem.id);
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = eventItem;
            return updated;
          }
          return [...prev, eventItem];
        });
      }
    };

    const handleUploadAssetsResponse = (msg: any) => {
      if (msg.type === MessageType.UPLOAD_ASSETS_RESPONSE && msg.payload) {
        const { name, type, path } = msg.payload;
        
        // 1. Add User message showing file upload
        setChatState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `upload-usr-${Date.now()}`,
              role: 'USER',
              timestamp: Date.now(),
              content: `[Uploaded ${type}: ${name}]`,
              status: 'SUCCESS'
            }
          ],
          isTyping: true
        }));

        // 2. Add AI analysis after 1.5 seconds
        setTimeout(() => {
          setChatState((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: `upload-ai-${Date.now()}`,
                role: 'ASSISTANT',
                timestamp: Date.now(),
                content: `I have analyzed the uploaded ${type} "${name}" at \`${path}\`.\n\n**Analysis Report:**\n* **Type:** ${type.toUpperCase()}\n* **Index Status:** Successfully parsed, chunked, and indexed.\n* **Context Expansion:** Added structural metadata and content vectors to the local search cache. Kairo-AI will refer to this context when generating code for future prompts.`,
                status: 'SUCCESS'
              }
            ],
            isTyping: false
          }));
        }, 1500);
      }
    };

    messageBus.subscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
    messageBus.subscribe(MessageType.TIMELINE_INIT, handleTimelineInit);
    messageBus.subscribe(MessageType.TIMELINE_UPDATE, handleTimelineUpdate);
    messageBus.subscribe(MessageType.EXECUTION_UPDATE, handleExecutionUpdate);
    messageBus.subscribe(MessageType.UPLOAD_ASSETS_RESPONSE, handleUploadAssetsResponse);
    messageBus.subscribe(MessageType.PIPELINE_STATUS, handlePipelineStatus);
    messageBus.subscribe(MessageType.EXECUTION_EVENT, handleExecutionEvent);

    return () => {
      messageBus.unsubscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
      messageBus.unsubscribe(MessageType.TIMELINE_INIT, handleTimelineInit);
      messageBus.unsubscribe(MessageType.TIMELINE_UPDATE, handleTimelineUpdate);
      messageBus.unsubscribe(MessageType.EXECUTION_UPDATE, handleExecutionUpdate);
      messageBus.unsubscribe(MessageType.UPLOAD_ASSETS_RESPONSE, handleUploadAssetsResponse);
      messageBus.unsubscribe(MessageType.PIPELINE_STATUS, handlePipelineStatus);
      messageBus.unsubscribe(MessageType.EXECUTION_EVENT, handleExecutionEvent);
    };
  }, [setChatState]);

  return (
    <div className="chat-timeline">
      {chatState.messages.length === 0 && pipelineEntries.length === 0 && executionEvents.length === 0 ? (
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
          {/* Antigravity Live Execution Timeline */}
          {executionEvents.length > 0 && (
            <LiveExecutionTimeline events={executionEvents} />
          )}
          {/* Real-time AI task progress fallback */}
          {executionEvents.length === 0 && pipelineEntries.length > 0 && (
            <PipelineStatusBubble entries={pipelineEntries} />
          )}
          {chatState.isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

