import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const EmbeddingStatusPanel: React.FC = () => {
  const [status, setStatus] = useState<any>({
    provider: 'MockOfflineProvider',
    pendingCount: 0,
    failedCount: 0,
    embeddedCount: 0,
    cacheHits: 0,
    totalJobs: 0
  });

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleEmbeddingUpdate = (msg: any) => {
      if (msg.type === MessageType.EMBEDDING_UPDATE) {
        const { event, pendingCount, failedCount, provider } = msg.payload || {};
        
        setStatus((prev: any) => {
          let embeddedCount = prev.embeddedCount;
          let cacheHits = prev.cacheHits;
          let totalJobs = prev.totalJobs;

          if (event) {
            if (event.type === 'EmbeddingQueued') {
              totalJobs++;
              if (event.payload?.queuedObj?.status === 'Completed') {
                cacheHits++;
                embeddedCount++;
              }
            } else if (event.type === 'EmbeddingGenerated') {
              embeddedCount++;
            }
          }

          return {
            provider: provider || prev.provider,
            pendingCount: pendingCount !== undefined ? pendingCount : prev.pendingCount,
            failedCount: failedCount !== undefined ? failedCount : prev.failedCount,
            embeddedCount,
            cacheHits,
            totalJobs
          };
        });

        if (event) {
          setLogs((prev) => [`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.type}: ${event.sourceId}`, ...prev.slice(0, 15)]);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.EMBEDDING_UPDATE, handleEmbeddingUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.EMBEDDING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_STATUS' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.EMBEDDING_UPDATE, handleEmbeddingUpdate);
    };
  }, []);

  const handleQueueMockJob = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.EMBEDDING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'QUEUE',
        sourceId: `file-mock-${Math.floor(Math.random() * 1000)}`,
        sourceType: 'File',
        content: `const test = "lorem ipsum random code block ${Math.random()}";`
      },
      version: '1.0.0' as any
    });
  };

  const handleProcessQueue = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.EMBEDDING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'PROCESS' },
      version: '1.0.0' as any
    });
  };

  const cacheHitRate = status.totalJobs > 0 ? Math.floor((status.cacheHits / status.totalJobs) * 100) : 100;

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Embedding Status Panel</h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={handleQueueMockJob}
            style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Queue Job
          </button>
          <button 
            onClick={handleProcessQueue}
            disabled={status.pendingCount === 0}
            style={{
              background: status.pendingCount === 0 ? '#555' : 'var(--vscode-button-secondaryBackground, #3c3c3c)',
              color: '#fff',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '3px',
              cursor: status.pendingCount === 0 ? 'default' : 'pointer',
              fontSize: '11px'
            }}
          >
            Process Queue
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Embedding Configuration</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <div>Provider: <strong style={{ color: '#4ec9b0' }}>{status.provider}</strong></div>
            <div>Queue Length: <strong style={{ color: status.pendingCount > 0 ? '#d7ba7d' : '#888' }}>{status.pendingCount}</strong></div>
            <div>Embedded Items: <strong style={{ color: '#4ec9b0' }}>{status.embeddedCount}</strong></div>
            <div>Failed Jobs: <strong style={{ color: status.failedCount > 0 ? '#f44336' : '#888' }}>{status.failedCount}</strong></div>
            <div>Cache Hit Rate: <strong style={{ color: '#d7ba7d' }}>{cacheHitRate}%</strong></div>
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Event Activity Log</h5>
          <div style={{
            maxHeight: '100px',
            overflowY: 'auto',
            padding: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '9px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px'
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ opacity: 0.8 }}>{log}</div>
            ))}
            {logs.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No active queue events recorded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
