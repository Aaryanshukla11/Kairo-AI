import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const PatchPreview: React.FC = () => {
  const [patches, setPatches] = useState<any[]>([]);
  const [selectedPatchId, setSelectedPatchId] = useState<string | null>(null);

  useEffect(() => {
    const handlePatchUpdate = (msg: any) => {
      if (msg.type === MessageType.PATCH_UPDATE) {
        const { patches: list, lastCreatedPatchId } = msg.payload || {};
        if (list) setPatches(list);
        if (lastCreatedPatchId) setSelectedPatchId(lastCreatedPatchId);
      }
    };

    vscodeBridge.subscribe(MessageType.PATCH_UPDATE, handlePatchUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PATCH_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_HISTORY' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.PATCH_UPDATE, handlePatchUpdate);
    };
  }, []);

  const handleApprove = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PATCH_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'APPROVE', patchId: id },
      version: '1.0.0' as any
    });
  };

  const handleReject = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PATCH_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'REJECT', patchId: id },
      version: '1.0.0' as any
    });
  };

  const handleApply = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PATCH_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'APPLY', patchId: id },
      version: '1.0.0' as any
    });
  };

  const handleRollback = (id: string) => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PATCH_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'ROLLBACK', patchId: id },
      version: '1.0.0' as any
    });
  };

  const selectedPatch = patches.find(p => p.id === selectedPatchId) || patches[0];

  const getMetrics = (patch: any) => {
    if (!patch || !patch.diff) return { added: 0, removed: 0 };
    const lines = patch.diff.split(/\r?\n/);
    let added = 0;
    let removed = 0;
    for (const l of lines) {
      if (l.startsWith('+')) added++;
      else if (l.startsWith('-')) removed++;
    }
    return { added, removed };
  };

  const metrics = getMetrics(selectedPatch);

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Patch Review Panel</h4>
        <span style={{ opacity: 0.6, fontSize: '11px' }}>Patches: <strong>{patches.length}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', maxHeight: '180px', overflowY: 'auto' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Patches queue</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {patches.map(p => (
              <div 
                key={p.id}
                onClick={() => setSelectedPatchId(p.id)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedPatchId === p.id ? 'var(--vscode-list-activeSelectionBackground, #37373d)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{p.filePath}</span>
                <span style={{
                  fontSize: '9px',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  backgroundColor: p.status === 'Applied' ? 'var(--success)' : 
                                   p.status === 'Approved' ? 'var(--vscode-charts-blue)' : 
                                   p.status === 'Rejected' ? 'var(--error)' : 'var(--border)',
                  color: '#000'
                }}>{p.status}</span>
              </div>
            ))}
            {patches.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No patches generated yet</span>
            )}
          </div>
        </div>

        {selectedPatch ? (
          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '6px', fontSize: '11px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
              <div>File: <strong style={{ color: '#fff' }}>{selectedPatch.filePath}</strong></div>
              <div>Type: <span>{selectedPatch.changeType}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#888' }}>
              <div>Lines Added: <strong style={{ color: '#4ec9b0' }}>+{metrics.added}</strong></div>
              <div>Lines Removed: <strong style={{ color: '#f85149' }}>-{metrics.removed}</strong></div>
              <div>Status: <strong>{selectedPatch.status}</strong></div>
            </div>

            <div style={{
              backgroundColor: '#1e1e1e',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '8px',
              maxHeight: '120px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '11px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.4'
            }}>
              {selectedPatch.diff ? (
                selectedPatch.diff.split('\n').map((line: string, idx: number) => {
                  let color = '#d4d4d4';
                  if (line.startsWith('+')) color = '#4ec9b0';
                  else if (line.startsWith('-')) color = '#f85149';
                  return (
                    <div key={idx} style={{ color }}>{line}</div>
                  );
                })
              ) : (
                <span style={{ fontStyle: 'italic', color: '#555' }}>No diff changes</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {selectedPatch.status === 'Validated' && (
                <>
                  <button 
                    onClick={() => handleApprove(selectedPatch.id)}
                    style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Approve Patch
                  </button>
                  <button 
                    onClick={() => handleReject(selectedPatch.id)}
                    style={{ background: 'var(--vscode-errorForeground, #f85149)', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Reject Patch
                  </button>
                </>
              )}

              {selectedPatch.status === 'Approved' && (
                <button 
                  onClick={() => handleApply(selectedPatch.id)}
                  style={{ background: '#4ec9b0', color: '#000', border: 'none', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                >
                  Apply Patch
                </button>
              )}

              {selectedPatch.status === 'Applied' && (
                <button 
                  onClick={() => handleRollback(selectedPatch.id)}
                  style={{ background: 'var(--vscode-button-secondaryBackground, #3c3c3c)', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
                >
                  Rollback Patch
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#666' }}>
            Select a patch to review diff overlays
          </div>
        )}
      </div>
    </div>
  );
};
