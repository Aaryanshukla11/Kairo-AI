import React, { useState, useEffect, useRef } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const ExecutionMonitor: React.FC = () => {
  const [activeReport, setActiveReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [currentTaskId, setCurrentTaskId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [toolCalls, setToolCalls] = useState<string[]>([]);

  const elapsedTimer = useRef<any>(null);

  useEffect(() => {
    const handleAgentUpdate = (msg: any) => {
      if (msg.type === MessageType.AGENT_UPDATE) {
        const { result, event } = msg.payload || {};
        if (result && result.report) {
          setActiveReport(result.report);
          setLoading(false);
          setProgress(100);
          if (elapsedTimer.current) clearInterval(elapsedTimer.current);
        }
        if (event) {
          if (event.type === 'TaskStarted') {
            setCurrentTaskId(event.payload?.taskId || '');
          }
          if (event.type === 'ToolInvoked') {
            setToolCalls(prev => [...prev, event.payload?.toolId]);
          }
          if (event.type === 'TaskFailed') {
            setErrorMsg(event.payload?.error || 'Task failed');
            setLoading(false);
            if (elapsedTimer.current) clearInterval(elapsedTimer.current);
          }
        }
      }
    };

    vscodeBridge.subscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
      if (elapsedTimer.current) clearInterval(elapsedTimer.current);
    };
  }, []);

  const handleStartExecution = () => {
    setLoading(true);
    setErrorMsg('');
    setActiveReport(null);
    setProgress(15);
    setElapsedTime(0);
    setToolCalls([]);

    elapsedTimer.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    const mockApprovedPlan = {
      id: 'plan-approved-999',
      goal: 'Compile production environment bundle',
      summary: 'Outlines webpack configurations rules and build tests scripts.',
      approved: true,
      validationSummary: { valid: true, errors: [] },
      tasks: [
        { id: 'task-1', title: 'Scan webpack dependencies config', type: 'Analyze', description: 'Analyze files', dependencies: [], affectedFiles: [] },
        { id: 'task-2', title: 'Synthesize bundles manifest file', type: 'Create', description: 'Create file', dependencies: ['task-1'], affectedFiles: ['webpack.manifest.json'] },
        { id: 'task-3', title: 'Verify bundle integrity specs', type: 'Test', description: 'Run build test', dependencies: ['task-2'], affectedFiles: [] }
      ]
    };

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
          title: 'Execute approved plan 999',
          assignedAgentId: 'executor-agent',
          payload: { plan: mockApprovedPlan },
          status: 'pending'
        }
      },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Execution Monitor Panel</h4>
        <button 
          onClick={handleStartExecution}
          disabled={loading}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '11px'
          }}
        >
          {loading ? 'Executing...' : 'Run Approved Plan'}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span>Task ID: <strong>{currentTaskId || 'Queuing...'}</strong></span>
            <span>Elapsed: {elapsedTime}s</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--vscode-button-background)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {activeReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#4ec9b0' }}>
            <span>Execution Completed successfully</span>
            <span>Time: {activeReport.executionTimeMs}ms</span>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
            <div>Completed: <strong>{activeReport.completedTasks.length}</strong></div>
            <div>Failed: <strong>{activeReport.failedTasks.length}</strong></div>
            <div>Tool usage: <span>{activeReport.toolUsage.join(', ') || 'none'}</span></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#888' }}>Execution Logs</label>
            <div style={{
              maxHeight: '80px',
              overflowY: 'auto',
              padding: '6px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              fontFamily: 'monospace',
              fontSize: '10px'
            }}>
              {activeReport.logs.map((log: string, idx: number) => (
                <div key={idx} style={{ color: '#aaa' }}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !activeReport && (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          Awaiting execution sequence triggers...
        </div>
      )}
    </div>
  );
};
