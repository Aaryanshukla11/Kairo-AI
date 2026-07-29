import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const RetrievalInspector: React.FC = () => {
  const [retrieved, setRetrieved] = useState<any | null>(null);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const [strategy, setStrategy] = useState<string>('Hybrid');
  const [promptInput, setPromptInput] = useState<string>('Where is context builder function?');

  useEffect(() => {
    const handleRetrieverUpdate = (msg: any) => {
      if (msg.type === MessageType.RETRIEVER_UPDATE) {
        const { retrievedContext } = msg.payload || {};
        if (retrievedContext) {
          setRetrieved(retrievedContext);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.RETRIEVER_UPDATE, handleRetrieverUpdate);

    return () => {
      vscodeBridge.unsubscribe(MessageType.RETRIEVER_UPDATE, handleRetrieverUpdate);
    };
  }, []);

  const handleRetrieveQuery = () => {
    const start = performance.now();
    
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RETRIEVER_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'RETRIEVE',
        request: {
          prompt: promptInput,
          currentFile: 'src/extension/index.ts',
          strategy: strategy as any
        }
      },
      version: '1.0.0' as any
    });

    setTimeout(() => {
      setTimeTaken(Math.round(performance.now() - start));
    }, 120);
  };

  const handleInvalidateCache = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RETRIEVER_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'INVALIDATE_CACHE' },
      version: '1.0.0' as any
    });
    setRetrieved(null);
    setTimeTaken(null);
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Retrieval Inspector</h4>
        <button 
          onClick={handleInvalidateCache}
          style={{ background: 'var(--vscode-button-secondaryBackground, #3c3c3c)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
        >
          Invalidate Cache
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Enter search prompt..."
            style={{ flex: 1, backgroundColor: 'var(--vscode-input-background, #3c3c3c)', color: '#fff', border: '1px solid var(--border)', borderRadius: '3px', padding: '3px 6px', fontSize: '11px' }}
          />
          <select 
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            style={{ backgroundColor: 'var(--vscode-dropdown-background, #3c3c3c)', color: '#fff', border: '1px solid var(--border)', borderRadius: '3px', padding: '2px 4px', fontSize: '11px' }}
          >
            <option value="Hybrid">Hybrid</option>
            <option value="Semantic">Semantic</option>
            <option value="Keyword">Keyword</option>
            <option value="Structural">Structural</option>
          </select>
          <button 
            onClick={handleRetrieveQuery}
            style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Query
          </button>
        </div>
      </div>

      {retrieved ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Retrieval Stats</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Strategy Used: <strong style={{ color: '#4ec9b0' }}>{strategy}</strong></div>
              <div>Confidence: <strong style={{ color: '#d7ba7d' }}>{(retrieved.confidenceScore * 100).toFixed(0)}%</strong></div>
              <div>Results Found: <strong>{retrieved.files.length + retrieved.symbols.length}</strong></div>
              <div>Query Time: <span>{timeTaken || 120} ms</span></div>
            </div>
          </div>

          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {retrieved.files?.length > 0 && (
              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Retrieved Files ({retrieved.files.length})</h5>
                <div style={{
                  maxHeight: '60px',
                  overflowY: 'auto',
                  padding: '4px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontFamily: 'monospace'
                }}>
                  {retrieved.files.map((f: any, idx: number) => (
                    <div key={idx} style={{ opacity: 0.8 }}>{f.filePath}</div>
                  ))}
                </div>
              </div>
            )}

            {retrieved.symbols?.length > 0 && (
              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Retrieved Symbols ({retrieved.symbols.length})</h5>
                <div style={{
                  maxHeight: '60px',
                  overflowY: 'auto',
                  padding: '4px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontFamily: 'monospace'
                }}>
                  {retrieved.symbols.map((s: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                      <span><strong>{s.name}</strong> ({s.filePath}:{s.line})</span>
                      <span style={{ color: '#4ec9b0' }}>{s.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '8px', opacity: 0.6, fontStyle: 'italic' }}>
          <span>No retrieval executed yet (or Project Index not scanned)</span>
        </div>
      )}
    </div>
  );
};
