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
  const [logs, setLogs] = useState<{ id: string; timestamp: string; text: string; type?: 'info' | 'success' | 'warning' | 'error' }[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping, stages, filesMap, overallStatus, currentActivity, logs]);

  useEffect(() => {
    const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const cleanText = text.trim();
      if (!cleanText) return;
      // Skip bare stage names without detail
      const bareStages = ['Workspace Scan', 'Intent Detection', 'Model Router', 'Planning', 'Waiting for Approval', 'Execution Pipeline', 'Code Synthesis', 'Execution Error'];
      if (bareStages.includes(cleanText)) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setLogs(prev => {
        const last = prev[prev.length - 1];
        if (last) {
          if (last.text === cleanText) return prev;
          if (cleanText.startsWith(last.text) && cleanText.length > last.text.length) {
            const updated = [...prev];
            updated[updated.length - 1] = { ...last, text: cleanText, type };
            return updated;
          }
          if (last.text.startsWith(cleanText)) return prev;
        }
        return [...prev.slice(-50), { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: timeStr, text: cleanText, type }];
      });
    };

    const handleEventBusUpdate = (msg: any) => {
      if ((msg.type === MessageType.EVENT_BUS_UPDATE || msg.type === (MessageType.EVENT_BUS_UPDATE as any) || msg.type === 104) && msg.payload) {
        const evt = msg.payload;
        const type = evt.eventType || evt.type;
        const payload = evt.payload || {};

        setOverallStatus((prev) => (prev === 'idle' ? 'running' : prev));

        // Append to real-time live activity log feed if it has specific payload content
        if (payload.filePath) {
          const fileAction = type === 'FileWriteStarted' ? 'Writing' : type === 'FileWriteCompleted' ? '✓ Written' : type === 'FileGenerationStarted' ? 'Generating' : 'File Action';
          addLog(`${fileAction}: ${payload.filePath}`, type.includes('Failed') ? 'error' : 'success');
        } else if (evt.message && evt.message !== type) {
          addLog(evt.message, type.includes('Failed') || type.includes('Error') ? 'error' : type.includes('Completed') || type.includes('Passed') ? 'success' : 'info');
        }

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
              return updateStage('st-7', 'completed');

            case 'FileValidationStarted':
              setCurrentActivity('Running validation...');
              return updateStage('st-8', 'active');
            case 'FileValidationCompleted':
              return updateStage('st-8', 'completed');

            case 'ExecutionCompleted':
            case 'ProjectCompleted':
              setOverallStatus('completed');
              setCurrentActivity('Project completed');
              return updateStage('st-9', 'completed');

            case 'ExecutionFailed':
            case 'ExecutionError':
              setCurrentActivity(`Execution failed: ${payload.error || payload.message || 'Check configuration'}`);
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
            const current: IFileActivityItem = newMap.get(filePath) || {
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

    const handleExecutionEvent = (msg: any) => {
      if (msg.payload) {
        const { stage, substage, message, status } = msg.payload;
        const detailParts = [substage, message].filter(Boolean);
        const detail = detailParts.length > 0 ? `${stage}: ${detailParts.join(' — ')}` : stage;

        if (detailParts.length > 0) {
          setCurrentActivity(detail);
          addLog(detail, status === 'error' ? 'error' : status === 'done' ? 'success' : 'info');
        }

        if (status === 'done' && (stage === 'Execution Complete' || stage === 'Completed')) {
          setOverallStatus('completed');
        } else if (status === 'error') {
          setOverallStatus('failed');
        } else {
          setOverallStatus('running');
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

    const handlePromptResponse = (msg: any) => {
      if (msg.payload) {
        const text = msg.payload.content || msg.payload.text;
        const msgId = msg.payload.id || `ai-${Date.now()}`;
        if (text) {
          setChatState((prev) => {
            const exists = prev.messages.find(m => m.id === msgId || (m.role === 'ASSISTANT' && m.content === text));
            if (exists) return prev;
            return {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: msgId,
                  role: 'ASSISTANT',
                  timestamp: Date.now(),
                  content: text,
                  status: 'SUCCESS'
                }
              ],
              isTyping: false
            };
          });
        }
      }
    };

    messageBus.subscribe(MessageType.EVENT_BUS_UPDATE, handleEventBusUpdate);
    messageBus.subscribe((MessageType.EVENT_BUS_UPDATE as any), handleEventBusUpdate);
    messageBus.subscribe(MessageType.EXECUTION_EVENT, handleExecutionEvent);
    messageBus.subscribe(MessageType.PIPELINE_STATUS, handleExecutionEvent);
    messageBus.subscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
    messageBus.subscribe(MessageType.PROMPT_RESPONSE, handlePromptResponse);
    messageBus.subscribe(MessageType.UPLOAD_ASSETS_RESPONSE, handleUploadAssetsResponse);

    return () => {
      messageBus.unsubscribe(MessageType.EVENT_BUS_UPDATE, handleEventBusUpdate);
      messageBus.unsubscribe((MessageType.EVENT_BUS_UPDATE as any), handleEventBusUpdate);
      messageBus.unsubscribe(MessageType.EXECUTION_EVENT, handleExecutionEvent);
      messageBus.unsubscribe(MessageType.PIPELINE_STATUS, handleExecutionEvent);
      messageBus.unsubscribe(MessageType.MOCK_RESPONSE, handleMockResponse);
      messageBus.unsubscribe(MessageType.PROMPT_RESPONSE, handlePromptResponse);
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

          {(chatState.isTyping || overallStatus === 'running') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', width: 'fit-content', margin: '4px 0' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} className="kairo-pulse-dot" />
              <span style={{ fontSize: '12.5px', color: '#a1a1aa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                {currentActivity || 'Processing request...'}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
