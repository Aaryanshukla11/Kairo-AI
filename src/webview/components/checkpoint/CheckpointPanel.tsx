import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const CheckpointPanel: React.FC = () => {
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [selectedCpId, setSelectedCpId] = useState<string | null>(null);

  useEffect(() => {
    const handleCheckpointUpdate = (msg: any) => {
      if (msg.type === MessageType.CHECKPOINT_UPDATE) {
        const { checkpoints: list, lastCreatedCheckpointId } = msg.payload || {};
        if (list) setCheckpoints(list);
        if (lastCreatedCheckpointId) setSelectedCpId(lastCreatedCheckpointId);
      }
    };

    vscodeBridge.subscribe(MessageType.CHECKPOINT_UPDATE, handleCheckpointUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CHECKPOINT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.CHECKPOINT_UPDATE, handleCheckpointUpdate);
    };
  }, []);

  const handleRestore = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CHECKPOINT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'RESTORE', checkpointId: id },
      version: '1.0.0' as any
    });
  };

  const handleDelete = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CHECKPOINT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'DELETE', checkpointId: id },
      version: '1.0.0' as any
    });
  };

  const selectedCp = checkpoints.find(c => c.id === selectedCpId) || checkpoints[0];

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Workspace Checkpoints</h4>
        <span style={{ opacity: 0.6, fontSize: '11px' }}>Total snapshots: <strong>{checkpoints.length}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', maxHeight: '180px', overflowY: 'auto' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Snapshots History</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {checkpoints.map(c => (
              <div 
                key={c.id}
                onClick={() => setSelectedCpId(c.id)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedCpId === c.id ? 'var(--vscode-list-activeSelectionBackground, #37373d)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                  {new Date(c.timestamp).toLocaleTimeString()}
                </span>
                <span style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  backgroundColor: c.status === 'Restored' ? 'var(--success)' : 
                                   c.status === 'Active' ? 'var(--vscode-charts-blue)' : 'var(--border)',
                  color: '#000'
                }}>{c.status}</span>
              </div>
            ))}
            {checkpoints.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No snapshots created yet</span>
            )}
          </div>
        </div>

        {selectedCp ? (
          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
              <div>Checkpoint ID: <span style={{ fontFamily: 'monospace' }}>{selectedCp.id.substring(0, 8)}</span></div>
              <div>Status: <strong>{selectedCp.status}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Timestamp: <span style={{ opacity: 0.8 }}>{new Date(selectedCp.timestamp).toLocaleString()}</span></div>
              <div>Workspace Hash: <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>{selectedCp.workspaceHash.substring(0, 12)}</span></div>
              <div>Transaction ID: <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>{selectedCp.transactionId.substring(0, 8)}</span></div>
            </div>

            <div style={{ marginTop: '4px' }}>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Affected Files ({selectedCp.affectedFiles.length})</h5>
              <div style={{
                maxHeight: '60px',
                overflowY: 'auto',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '3px',
                fontSize: '10px',
                fontFamily: 'monospace'
              }}>
                {selectedCp.affectedFiles.map((f: string) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button 
                onClick={() => handleRestore(selectedCp.id)}
                style={{
                  background: 'var(--vscode-button-background)',
                  color: 'var(--vscode-button-foreground)',
                  border: 'none',
                  padding: '3px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              >
                Restore Snapshot
              </button>
              <button 
                onClick={() => handleDelete(selectedCp.id)}
                style={{
                  background: 'transparent',
                  color: 'var(--vscode-errorForeground, #f85149)',
                  border: '1px solid var(--vscode-errorForeground, #f85149)',
                  padding: '2px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Delete Snapshot
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#666' }}>
            Select a checkpoint snapshot to review detail properties
          </div>
        )}
      </div>
    </div>
  );
};
