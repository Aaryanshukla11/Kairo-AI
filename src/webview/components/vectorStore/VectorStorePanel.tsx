import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const VectorStorePanel: React.FC = () => {
  const [stats, setStats] = useState<any>({
    storedCount: 0,
    dimensions: 384,
    provider: 'MemoryStoreProvider',
    storageSizeBytes: 0,
    cacheHitRate: 100,
    isReady: true
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const handleVectorStoreUpdate = (msg: any) => {
      if (msg.type === MessageType.VECTOR_STORE_UPDATE) {
        const { event, stats: newStats, searchResults: results } = msg.payload || {};
        if (newStats) setStats(newStats);
        if (results) setSearchResults(results);

        if (event) {
          setLogs((prev) => [`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.type}: ${event.vectorId || ''}`, ...prev.slice(0, 15)]);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.VECTOR_STORE_UPDATE, handleVectorStoreUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.VECTOR_STORE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_STATS' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.VECTOR_STORE_UPDATE, handleVectorStoreUpdate);
    };
  }, []);

  const handleInsertMockVector = () => {
    const mockVector: number[] = [];
    for (let i = 0; i < 384; i++) {
      mockVector.push(Math.random());
    }

    const mockId = `vec-${Math.floor(Math.random() * 1000)}`;

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.VECTOR_STORE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'INSERT',
        record: {
          id: mockId,
          embeddingId: `emb-${mockId}`,
          sourceId: `file-mock-${mockId}.ts`,
          sourceType: 'File',
          provider: stats.provider,
          dimensions: 384,
          metadata: { path: `src/mock/${mockId}.ts` },
          checksum: `md5-${mockId}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          vector: mockVector
        }
      },
      version: '1.0.0' as any
    });
  };

  const handleClearIndex = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.VECTOR_STORE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'CLEAR' },
      version: '1.0.0' as any
    });
    setSearchResults([]);
  };

  const handleSimilaritySearch = () => {
    const queryVector: number[] = [];
    for (let i = 0; i < 384; i++) {
      queryVector.push(0.5);
    }

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.VECTOR_STORE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'SEARCH',
        queryVector,
        limit: 3,
        metric: 'Cosine'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Vector Store Console</h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={handleInsertMockVector}
            style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Insert
          </button>
          <button 
            onClick={handleSimilaritySearch}
            disabled={stats.storedCount === 0}
            style={{
              background: stats.storedCount === 0 ? '#555' : 'var(--vscode-button-secondaryBackground, #3c3c3c)',
              color: '#fff',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '3px',
              cursor: stats.storedCount === 0 ? 'default' : 'pointer',
              fontSize: '11px'
            }}
          >
            Search
          </button>
          <button 
            onClick={handleClearIndex}
            style={{ background: '#f44336', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Database Metrics</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <div>Provider: <strong style={{ color: '#4ec9b0' }}>{stats.provider}</strong></div>
            <div>Stored Vectors: <strong>{stats.storedCount}</strong></div>
            <div>Dimensions: <span style={{ color: '#d7ba7d' }}>{stats.dimensions}</span></div>
            <div>Persisted Size: <span>{(stats.storageSizeBytes / 1024).toFixed(2)} KB</span></div>
            <div>Cache Hit Rate: <strong style={{ color: '#4ec9b0' }}>{stats.cacheHitRate}%</strong></div>
            <div>Status: <span style={{ color: stats.isReady ? '#4ec9b0' : '#f44336' }}>{stats.isReady ? 'Active Ready' : 'Initializing'}</span></div>
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Query Search Results ({searchResults.length})</h5>
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
            {searchResults.map((res, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2px' }}>
                <span style={{ color: '#4ec9b0' }}>{res.record.id} ({res.record.sourceId})</span>
                <span style={{ opacity: 0.6 }}>score: {res.score.toFixed(4)}</span>
              </div>
            ))}
            {searchResults.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No similarity searches queried</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
