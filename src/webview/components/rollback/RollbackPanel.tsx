import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const RollbackPanel: React.FC = () => {
  const [rollbacks, setRollbacks] = useState<any[]>([]);
  const [historyLog, setHistoryLog] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [selectedRollbackId, setSelectedRollbackId] = useState<string | null>(null);

  useEffect(() => {
    const handleRollbackUpdate = (msg: any) => {
      if (msg.type === MessageType.ROLLBACK_UPDATE) {
        const { rollbacks: list, historyLog: logs, preview: prev, lastCreatedRollbackId } = msg.payload || {};
        if (list) setRollbacks(list);
        if (logs) setHistoryLog(logs);
        if (prev) setPreview(prev);
        if (lastCreatedRollbackId) setSelectedRollbackId(lastCreatedRollbackId);
      }
    };

    vscodeBridge.subscribe(MessageType.ROLLBACK_UPDATE, handleRollbackUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.ROLLBACK_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.ROLLBACK_UPDATE, handleRollbackUpdate);
    };
  }, []);

  const handleExecuteRollback = (rollbackId: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.ROLLBACK_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'EXECUTE', rollbackId },
      version: '1.0.0' as any
    });
  };

  const selectedRollback = rollbacks.find(r => r.id === selectedRollbackId) || rollbacks[0];

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Rollback Control Center</h4>
        <span style={{ opacity: 0.6, fontSize: '11px' }}>Rollback Actions: <strong>{rollbacks.length}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', maxHeight: '180px', overflowY: 'auto' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Revert Queue</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {rollbacks.map(r => (
              <div 
                key={r.id}
                onClick={() => setSelectedRollbackId(r.id)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedRollbackId === r.id ? 'var(--vscode-list-activeSelectionBackground, #37373d)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>Revert Patch</span>
                <span style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  backgroundColor: r.status === 'Completed' ? 'var(--success)' : 
                                   r.status === 'Ready' ? 'var(--vscode-charts-blue)' : 
                                   r.status === 'Failed' ? 'var(--error)' : 'var(--border)',
                  color: '#000'
                }}>{r.status}</span>
              </div>
            ))}
            {rollbacks.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No active rollbacks configured</span>
            )}
          </div>
        </div>

        {selectedRollback ? (
          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', fontSize: '11px', color: '#888' }}>
              <div>Rollback Plan: <strong style={{ color: '#fff' }}>{selectedRollback.rollbackPlan}</strong></div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '4px',
              padding: '8px',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div>Affected Files: <strong>{selectedRollback.affectedFiles.join(', ')}</strong></div>
              {preview && (
                <>
                  <div style={{ color: '#4ec9b0' }}>Lines Restored: <strong>+{preview.linesRestored}</strong></div>
                  <div style={{ color: '#f85149' }}>Lines Removed: <strong>-{preview.linesRemoved}</strong></div>
                  <div>Estimated Impact: <strong style={{
                    color: preview.estimatedImpact === 'High' ? 'var(--error)' :
                           preview.estimatedImpact === 'Medium' ? 'var(--vscode-charts-orange)' : 'var(--success)'
                  }}>{preview.estimatedImpact}</strong></div>
                </>
              )}
              <div>Status: <strong>{selectedRollback.status}</strong></div>
            </div>

            {selectedRollback.status === 'Ready' && (
              <button 
                onClick={() => handleExecuteRollback(selectedRollback.id)}
                style={{
                  background: 'var(--vscode-button-background)',
                  color: 'var(--vscode-button-foreground)',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  alignSelf: 'flex-start'
                }}
              >
                Execute Restore Action
              </button>
            )}
          </div>
        ) : (
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#666' }}>
            Configure or select a rollback to restore states
          </div>
        )}
      </div>
    </div>
  );
};
