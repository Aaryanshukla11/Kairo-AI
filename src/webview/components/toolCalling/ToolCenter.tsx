import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ToolCenter: React.FC = () => {
  const [toolsList, setToolsList] = useState<any[]>([
    { id: 'filesystem-read-file', name: 'Read Workspace File', category: 'Filesystem', status: 'Available', permissions: ['READ'] },
    { id: 'terminal-execute-command', name: 'Execute Shell Command', category: 'Terminal', status: 'Available', permissions: ['EXECUTE'] },
    { id: 'git-status', name: 'Git Status', category: 'Git', status: 'Available', permissions: ['READ'] },
    { id: 'workspace-list-files', name: 'List Workspace Files', category: 'Workspace', status: 'Available', permissions: ['READ'] },
    { id: 'diagnostics-read-logs', name: 'Read Diagnostics Logs', category: 'Diagnostics', status: 'Available', permissions: ['READ'] }
  ]);

  const [history, setHistory] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('filesystem-read-file');
  const [argsInput, setArgsInput] = useState<string>('{"path": "c:/mock/path/file.ts"}');
  const [lastResult, setLastResult] = useState<string>('');

  useEffect(() => {
    const handleToolCallingUpdate = (msg: any) => {
      if (msg.type === MessageType.TOOL_CALLING_UPDATE) {
        const { history: newHistory, result } = msg.payload || {};
        if (newHistory) setHistory(newHistory);
        if (result) {
          setLastResult(JSON.stringify(result, null, 2));
        }
      }
    };

    vscodeBridge.subscribe(MessageType.TOOL_CALLING_UPDATE, handleToolCallingUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.TOOL_CALLING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.TOOL_CALLING_UPDATE, handleToolCallingUpdate);
    };
  }, []);

  const handleExecuteTool = () => {
    try {
      const parsedArgs = JSON.parse(argsInput);
      setLastResult('Running...');
      vscodeBridge.postMessage({
        id: Date.now().toString(),
        type: MessageType.TOOL_CALLING_REQUEST,
        timestamp: Date.now(),
        source: MessageSource.WEBVIEW,
        target: MessageTarget.EXTENSION,
        payload: {
          action: 'EXECUTE',
          toolId: selectedTool,
          args: parsedArgs
        },
        version: '1.0.0' as any
      });
    } catch (err: any) {
      setLastResult(`Args parsing error: ${err.message}`);
    }
  };

  const handleToolSelect = (id: string) => {
    setSelectedTool(id);
    if (id === 'filesystem-read-file') {
      setArgsInput('{"path": "c:/mock/path/file.ts"}');
    } else if (id === 'terminal-execute-command') {
      setArgsInput('{"command": "npm run test"}');
    } else if (id === 'workspace-list-files') {
      setArgsInput('{"maxResults": 5}');
    } else {
      setArgsInput('{}');
    }
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Tool Center Monitor</h4>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1.2, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Registered Tools</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
            {toolsList.map(t => (
              <div 
                key={t.id} 
                onClick={() => handleToolSelect(t.id)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedTool === t.id ? 'var(--vscode-list-activeSelectionBackground, #3c3c3c)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{t.name}</span>
                <span style={{ fontSize: '10px', color: '#888' }}>{t.category}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
            <label style={{ fontSize: '10px', color: '#888' }}>Input Arguments (JSON)</label>
            <textarea 
              value={argsInput}
              onChange={(e) => setArgsInput(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                fontFamily: 'monospace',
                fontSize: '10px',
                padding: '4px'
              }}
            />
            <button 
              onClick={handleExecuteTool}
              style={{
                background: 'var(--vscode-button-background)',
                color: '#fff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                marginTop: '4px'
              }}
            >
              Invoke Tool
            </button>
          </div>
        </div>

        <div style={{ flex: 1.5, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Execution Monitor Output</h5>
          <div style={{
            flex: 1,
            maxHeight: '120px',
            overflowY: 'auto',
            padding: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '10px',
            whiteSpace: 'pre-wrap'
          }}>
            {lastResult || <span style={{ fontStyle: 'italic', color: '#666' }}>No execution details yet...</span>}
          </div>

          <h5 style={{ margin: '6px 0 2px 0', fontSize: '11px', color: '#888' }}>Execution History</h5>
          <div style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {history.length === 0 ? (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No runs recorded.</span>
            ) : (
              history.map((h, i) => (
                <div key={h.id || i} style={{ display: 'flex', justifyContent: 'space-between', color: h.success ? '#4ec9b0' : '#f44336' }}>
                  <span>{h.toolId}</span>
                  <span>{h.latencyMs}ms</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
