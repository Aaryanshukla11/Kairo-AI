import React, { useState, useEffect, useRef } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

interface TerminalConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({ isOpen, onClose, onOpen }) => {
  const [commands, setCommands] = useState<any[]>([]);
  const [activeCommand, setActiveCommand] = useState<any>(null);
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
  const [customCommand, setCustomCommand] = useState('');
  const outputEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleTerminalUpdate = (msg: any) => {
      if (msg.type === MessageType.TERMINAL_UPDATE) {
        const { commands: cmds, activeCommand: active } = msg.payload || {};
        if (cmds) setCommands(cmds);
        if (active) {
          setActiveCommand(active);
          setSelectedCommandId(active.id);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.TERMINAL_UPDATE, handleTerminalUpdate);
    
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.TERMINAL_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.TERMINAL_UPDATE, handleTerminalUpdate);
    };
  }, []);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeCommand?.stdout, activeCommand?.stderr, selectedCommandId]);

  const handleExecute = (cmdStr: string) => {
    if (!cmdStr.trim()) return;
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.TERMINAL_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'EXECUTE', command: cmdStr },
      version: '1.0.0' as any
    });
    setCustomCommand('');
  };

  const handleCancel = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.TERMINAL_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'CANCEL' },
      version: '1.0.0' as any
    });
  };

  const selectedCommand = commands.find(c => c.id === selectedCommandId) || activeCommand;

  const quickCommands = [
    'pwd',
    'ls',
    'git status',
    'npm run dev',
    'python --version'
  ];

  if (!isOpen) {
    return (
      <div 
        onClick={onOpen}
        style={{
          height: '32px',
          backgroundColor: '#1e1e1e',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          color: '#aaa',
          userSelect: 'none'
        }}
      >
        <span>Terminal Console (Collapsed)</span>
        <span>Expand ↗</span>
      </div>
    );
  }

  return (
    <div style={{
      height: '240px',
      backgroundColor: '#1e1e1e',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      color: '#d4d4d4',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <div style={{
        height: '32px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #2d2d2d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Terminal Console</span>
          {activeCommand && (
            <span style={{
              backgroundColor: '#e51400',
              color: 'white',
              fontSize: '9px',
              padding: '1px 6px',
              borderRadius: '2px'
            }}>RUNNING</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Collapse ↙
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: '200px',
          borderRight: '1px solid #2d2d2d',
          overflowY: 'auto',
          backgroundColor: '#181818',
          padding: '6px'
        }}>
          <div style={{ fontSize: '10px', color: '#6a9955', marginBottom: '8px', fontWeight: 600 }}>Command History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {commands.map((cmd) => (
              <div 
                key={cmd.id}
                onClick={() => setSelectedCommandId(cmd.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedCommandId === cmd.id ? '#2a2d2e' : 'transparent',
                  color: cmd.status === 'Failed' ? '#f85149' : cmd.status === 'Completed' ? '#4ec9b0' : '#d4d4d4',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '11px'
                }}
                title={cmd.command}
              >
                $ {cmd.command}
              </div>
            ))}
            {commands.length === 0 && (
              <span style={{ color: '#666', fontSize: '11px', fontStyle: 'italic' }}>No commands run</span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedCommand ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
              <div style={{ borderBottom: '1px solid #2d2d2d', paddingBottom: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
                <div>
                  Running in: <span style={{ color: '#569cd6' }}>{selectedCommand.workingDirectory}</span>
                </div>
                <div>
                  Exit code: <span style={{ color: selectedCommand.exitCode === 0 ? '#4ec9b0' : '#f85149' }}>{selectedCommand.exitCode !== undefined && selectedCommand.exitCode !== null ? selectedCommand.exitCode : 'N/A'}</span>
                </div>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '11px',
                lineHeight: '1.5',
                color: '#d4d4d4',
                paddingRight: '6px'
              }}>
                {selectedCommand.stdout || selectedCommand.stderr ? (
                  <>
                    {selectedCommand.stdout}
                    <span style={{ color: '#f85149' }}>{selectedCommand.stderr}</span>
                  </>
                ) : (
                  <span style={{ color: '#555', fontStyle: 'italic' }}>Waiting for output...</span>
                )}
                <div ref={outputEndRef} />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontStyle: 'italic' }}>
              Select a command or execute one below
            </div>
          )}

          <div style={{
            height: '42px',
            backgroundColor: '#252526',
            borderTop: '1px solid #2d2d2d',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            gap: '8px'
          }}>
            <select 
              onChange={(e) => handleExecute(e.target.value)}
              defaultValue=""
              style={{
                backgroundColor: '#3c3c3c',
                color: '#fff',
                border: '1px solid var(--border)',
                padding: '4px 6px',
                borderRadius: '3px',
                fontSize: '11px',
                outline: 'none',
                maxWidth: '120px'
              }}
            >
              <option value="" disabled>Run Command...</option>
              {quickCommands.map(qc => (
                <option key={qc} value={qc}>{qc}</option>
              ))}
            </select>

            <input 
              type="text"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecute(customCommand);
              }}
              placeholder="Type command (e.g. npm install)..."
              style={{
                flex: 1,
                backgroundColor: '#1e1e1e',
                color: '#fff',
                border: '1px solid var(--border)',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />

            <button
              onClick={() => handleExecute(customCommand)}
              style={{
                background: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Execute
            </button>

            {activeCommand && (
              <button
                onClick={handleCancel}
                style={{
                  background: 'var(--vscode-errorForeground, #f85149)',
                  color: '#fff',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Kill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
