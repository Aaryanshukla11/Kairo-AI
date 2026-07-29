import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const AgentMonitor: React.FC = () => {
  const [stats, setStats] = useState<any[]>([
    { id: 'planner-agent', name: 'Planner Agent', role: 'Planning', status: 'Idle', executionTimeMs: 0, messagesSent: 0, messagesReceived: 0, capabilities: ['planning'] },
    { id: 'executor-agent', name: 'Executor Agent', role: 'Synthesis', status: 'Idle', executionTimeMs: 0, messagesSent: 0, messagesReceived: 0, capabilities: ['synthesis'] },
    { id: 'reviewer-agent', name: 'Reviewer Agent', role: 'Reviewing', status: 'Idle', executionTimeMs: 0, messagesSent: 0, messagesReceived: 0, capabilities: ['reviewing'] },
    { id: 'workspace-agent', name: 'Workspace Agent', role: 'Sync', status: 'Idle', executionTimeMs: 0, messagesSent: 0, messagesReceived: 0, capabilities: ['discovery'] },
    { id: 'retriever-agent', name: 'Retriever Agent', role: 'Similarity', status: 'Idle', executionTimeMs: 0, messagesSent: 0, messagesReceived: 0, capabilities: ['retrieval'] }
  ]);

  const [selectedAgent, setSelectedAgent] = useState<string>('planner-agent');
  const [taskTitle, setTaskTitle] = useState<string>('Outline project context build plan');
  const [lastResult, setLastResult] = useState<string>('');

  useEffect(() => {
    const handleAgentUpdate = (msg: any) => {
      if (msg.type === MessageType.AGENT_UPDATE) {
        const { stats: newStats, result } = msg.payload || {};
        if (newStats) setStats(newStats);
        if (result) {
          setLastResult(JSON.stringify(result, null, 2));
        }
      }
    };

    vscodeBridge.subscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.AGENT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_STATS' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
    };
  }, []);

  const handleDispatchTask = () => {
    setLastResult('Running agent...');
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.AGENT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'DISPATCH',
        task: {
          id: `task-${Date.now()}`,
          title: taskTitle,
          assignedAgentId: selectedAgent,
          payload: { text: taskTitle },
          status: 'pending'
        }
      },
      version: '1.0.0' as any
    });
  };

  const handleLoadAgent = (agentId: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.AGENT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'LOAD', agentId },
      version: '1.0.0' as any
    });
  };

  const handleUnloadAgent = (agentId: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.AGENT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'UNLOAD', agentId },
      version: '1.0.0' as any
    });
  };

  return (
    <div style={{
      backgroundColor: 'var(--vscode-sideBar-background, #252526)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      color: '#d4d4d4',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      textAlign: 'left'
    }}>
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Agent Monitor Dashboard</h4>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1.5, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Active Agents</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {stats.map(a => (
              <div 
                key={a.id} 
                onClick={() => setSelectedAgent(a.id)}
                style={{
                  padding: '6px',
                  borderRadius: '4px',
                  border: selectedAgent === a.id ? '1px solid var(--vscode-button-background)' : '1px solid transparent',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{a.name}</span>
                  <span style={{
                    color: a.status === 'Running' ? '#4ec9b0' : a.status === 'Preparing' ? '#cca700' : '#888',
                    fontSize: '10px'
                  }}>{a.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', marginTop: '4px' }}>
                  <span>Sent: {a.messagesSent} | Recv: {a.messagesReceived}</span>
                  <span>Time: {a.executionTimeMs}ms</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleLoadAgent(a.id); }}
                    style={{ fontSize: '9px', background: 'transparent', color: '#fff', border: '1px solid #555', cursor: 'pointer', padding: '1px 4px' }}
                  >
                    Start
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUnloadAgent(a.id); }}
                    style={{ fontSize: '9px', background: 'transparent', color: '#fff', border: '1px solid #555', cursor: 'pointer', padding: '1px 4px' }}
                  >
                    Stop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1.2, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Dispatch Task</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#888' }}>Task Title</label>
            <input 
              type="text" 
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '4px',
                fontSize: '11px'
              }}
            />
            <button 
              onClick={handleDispatchTask}
              style={{
                background: 'var(--vscode-button-background)',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                marginTop: '6px'
              }}
            >
              Assign Task
            </button>
          </div>

          <h5 style={{ margin: '8px 0 2px 0', fontSize: '11px', color: '#888' }}>Execution Results</h5>
          <div style={{
            flex: 1,
            maxHeight: '110px',
            overflowY: 'auto',
            padding: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '10px',
            whiteSpace: 'pre-wrap'
          }}>
            {lastResult || <span style={{ fontStyle: 'italic', color: '#666' }}>No active run...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
