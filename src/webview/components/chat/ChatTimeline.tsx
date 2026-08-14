import React, { useEffect, useRef, useState } from 'react';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { useAppContext } from '../../context/AppContext';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { SystemMessage } from './SystemMessage';
import { messageBus } from '../../services/messageBus';
import { MessageType } from '../../../common/protocol';
import { PlanProposalMessage } from './PlanProposalMessage';
import { ActivityContainer } from '../activity/ActivityContainer';
import { IStageActivityItemData } from '../activity/StageActivityItem';
import { IFileActivityItem } from '../activity/FileActivityRow';

const INITIAL_STAGES: IStageActivityItemData[] = [
  { id: 'st-1', label: 'Understanding Request', status: 'pending' },
  { id: 'st-2', label: 'Analyzing Workspace', status: 'pending' },
  { id: 'st-3', label: 'Detecting Requirements', status: 'pending' },
  { id: 'st-4', label: 'Designing Architecture', status: 'pending' },
  { id: 'st-5', label: 'Creating Implementation Plan', status: 'pending' },
  { id: 'st-6', label: 'Generating Files', status: 'pending' },
  { id: 'st-7', label: 'Writing Files to Workspace', status: 'pending' },
  { id: 'st-8', label: 'Running Validation', status: 'pending' },
  { id: 'st-9', label: 'Completed', status: 'pending' }
];

export function ChatTimeline(): React.JSX.Element {
  const { chatState, setChatState } = useAppContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [stages, setStages] = useState<IStageActivityItemData[]>(INITIAL_STAGES);
  const [filesMap, setFilesMap] = useState<Map<string, IFileActivityItem>>(new Map());
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed' | 'failed' | 'cancelled'>('idle');
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [taskComplexity, setTaskComplexity] = useState<'SMALL' | 'MEDIUM' | 'COMPLEX'>('COMPLEX');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping, stages, filesMap, overallStatus, currentActivity]);

  useEffect(() => {
    const handleEventBusUpdate = (msg: any) => {
      if ((msg.type === MessageType.EVENT_BUS_UPDATE || msg.type === (MessageType.EVENT_BUS_UPDATE as any) || msg.type === 104) && msg.payload) {
        const evt = msg.payload;
        const type = evt.eventType || evt.type;
        const payload = evt.payload || {};

        setOverallStatus((prev) => (prev === 'idle' ? 'running' : prev));

        // Update pipeline stage states
        setStages((prevStages) => {
          const updateStage = (stageId: string, status: 'active' | 'completed' | 'failed') => {
            return prevStages.map(st => {
              if (st.id === stageId) return { ...st, status };
              if (status === 'completed' && st.id < stageId && st.status !== 'completed') return { ...st, status: 'completed' as const };
              return st;
            });
          };

          switch (type) {
            case 'PromptReceived':
            case 'IntentDetected':
              setCurrentActivity('Understanding request...');
              if (payload.intent === 'MODIFY_PROJECT' || payload.intent === 'CHAT') {
                setTaskComplexity('SMALL');
              }
              return updateStage('st-1', 'active');

            case 'WorkspaceAnalysisStarted':
              setCurrentActivity('Analyzing workspace...');
              return updateStage('st-2', 'active');
            case 'WorkspaceAnalysisCompleted':
              return updateStage('st-2', 'completed');

            case 'RequirementAnalysisStarted':
              setCurrentActivity('Detecting requirements...');
              return updateStage('st-3', 'active');
            case 'RequirementAnalysisCompleted':
            case 'RequirementCompleted':
              return updateStage('st-3', 'completed');

            case 'ArchitectureGenerationStarted':
              setCurrentActivity('Designing architecture...');
              return updateStage('st-4', 'active');
            case 'ArchitectureGenerationCompleted':
            case 'ArchitectureCompleted':
            case 'ArchitectureReady':
              return updateStage('st-4', 'completed');

            case 'ImplementationPlanStarted':
              setCurrentActivity('Creating implementation plan...');
              return updateStage('st-5', 'active');
            case 'ImplementationPlanCompleted':
            case 'PlanningCompleted':
              setCurrentActivity('Plan created. Waiting for user approval...');
              return updateStage('st-5', 'completed');

            case 'GenerationStarted':
            case 'GeneratorStarted':
              setCurrentActivity('Generating components...');
              return updateStage('st-6', 'active');
            case 'GenerationCompleted':
              return updateStage('st-6', 'completed');

            case 'FileWriteStarted':
              return updateStage('st-7', 'active');
            case 'FileWriteCompleted':
              return updateStage('st-7', 'active');

            case 'FileValidationStarted':
              setCurrentActivity('Running validation...');
              return updateStage('st-8', 'active');
            case 'FileValidationCompleted':
              return updateStage('st-8', 'completed');

            case 'ExecutionCompleted':
            case 'ProjectCompleted':
              setCurrentActivity('Project completed');
              setOverallStatus('completed');
              return prevStages.map(st => ({ ...st, status: 'completed' as const }));

            case 'ExecutionFailed':
              setCurrentActivity('Execution failed');
              setOverallStatus('failed');
              return prevStages.map(st => st.status === 'active' ? { ...st, status: 'failed' as const } : st);

            default:
              return prevStages;
          }
        });

        // Track file activity state transitions
        if (payload.filePath) {
          const filePath = payload.filePath;
          setFilesMap((prevMap) => {
            const newMap = new Map(prevMap);
            const current = newMap.get(filePath) || {
              filePath,
              status: 'PENDING'
            };

            if (type === 'FileGenerationStarted') {
              current.status = 'GENERATING';
              setCurrentActivity(`Generating ${filePath}...`);
            } else if (type === 'FileGenerationCompleted') {
              current.status = 'GENERATED';
            } else if (type === 'FileWriteStarted') {
              current.status = 'WRITING';
              setCurrentActivity(`Writing ${filePath}...`);
            } else if (type === 'FileWriteCompleted') {
              current.status = 'CREATED';
              setCurrentActivity(`Created ${filePath}`);
            } else if (type === 'FileWriteFailed') {
              current.status = 'FAILED';
              current.error = payload.error || 'Disk write failed';
              setCurrentActivity(`Failed ${filePath}`);
            }

            newMap.set(filePath, current);
            return newMap;
          });
        }
      }
    };

    const handleMockResponse = (msg: any) => {
      if (msg.type === MessageType.MOCK_RESPONSE && msg.payload) {
        setChatState((prev) => {
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

    const handleUploadAssetsResponse = (msg: any) => {
      if (msg.type === MessageType.UPLOAD_ASSETS_RESPONSE && msg.payload) {
        const { name, type, path } = msg.payload;
        
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

    messageBus.subscribe(MessageType.EVENT_BUS_UPDATE, handleEventBusUpdate);
    messageBus.subscribe((MessageType.EVENT_BUS_UPDATE as any), handleEventBusUpdate);
    messageBus.subscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
    messageBus.subscribe(MessageType.UPLOAD_ASSETS_RESPONSE, handleUploadAssetsResponse);

    return () => {
      messageBus.unsubscribe(MessageType.EVENT_BUS_UPDATE, handleEventBusUpdate);
      messageBus.unsubscribe((MessageType.EVENT_BUS_UPDATE as any), handleEventBusUpdate);
      messageBus.unsubscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
      messageBus.unsubscribe(MessageType.UPLOAD_ASSETS_RESPONSE, handleUploadAssetsResponse);
    };
  }, [setChatState]);

  return (
    <div className="chat-timeline">
      {chatState.messages.length === 0 && overallStatus === 'idle' ? (
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
                />
              );
            }
            return null;
          })}

          {/* Real-Time Live Activity UX */}
          {overallStatus !== 'idle' && (
            <ActivityContainer
              taskComplexity={taskComplexity}
              currentActivity={currentActivity}
              overallStatus={overallStatus}
              stages={stages}
              files={Array.from(filesMap.values())}
            />
          )}

          {chatState.isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
