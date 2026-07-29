import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ProjectExplorer: React.FC = () => {
  const [index, setIndex] = useState<any | null>(null);
  const [percent, setPercent] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    const handleIndexerUpdate = (msg: any) => {
      if (msg.type === MessageType.INDEXER_UPDATE) {
        const { index: projectIndex, event } = msg.payload || {};
        if (projectIndex) setIndex(projectIndex);

        if (event?.type === 'IndexStarted') {
          setIsScanning(true);
          setPercent(0);
        } else if (event?.type === 'FileIndexed') {
          setPercent(event.payload?.percent || 0);
        } else if (event?.type === 'IndexCompleted') {
          setIsScanning(false);
          setPercent(null);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.INDEXER_UPDATE, handleIndexerUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.INDEXER_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_INDEX' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.INDEXER_UPDATE, handleIndexerUpdate);
    };
  }, []);

  const handleTriggerScan = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.INDEXER_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'START', workspaceId: 'ws-active' },
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Project Semantic Explorer</h4>
        <button 
          onClick={handleTriggerScan}
          disabled={isScanning}
          style={{
            background: isScanning ? '#555' : 'var(--vscode-button-background, #0e639c)',
            color: '#fff',
            border: 'none',
            padding: '3px 10px',
            borderRadius: '3px',
            cursor: isScanning ? 'default' : 'pointer',
            fontSize: '11px',
            fontWeight: 600
          }}
        >
          {isScanning ? `Scanning (${percent || 0}%)` : 'Scan Project'}
        </button>
      </div>

      {index ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Workspace Environment</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Framework: <strong style={{ color: '#4ec9b0' }}>{index.framework}</strong></div>
              <div>Language: <strong style={{ color: '#d7ba7d' }}>{index.language}</strong></div>
              <div>Files Indexed: <strong>{index.files.length}</strong></div>
              <div>Folders Indexed: <span>{index.folders.length}</span></div>
              <div>Symbols Logged: <strong>{index.symbols.length}</strong></div>
            </div>

            {index.dependencies?.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Dependencies ({index.dependencies.length})</h5>
                <div style={{
                  maxHeight: '60px',
                  overflowY: 'auto',
                  padding: '4px 6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '3px',
                  fontSize: '9px',
                  fontFamily: 'monospace'
                }}>
                  {index.dependencies.map((d: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100px' }}>{d.sourceFilePath}</span>
                      <span>→ {d.targetFilePath}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Workspace Symbols</h5>
              <div style={{
                maxHeight: '130px',
                overflowY: 'auto',
                padding: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {index.symbols.map((sym: any, idx: number) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '10px',
                      padding: '2px 4px',
                      borderRadius: '2px',
                      backgroundColor: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <span>
                      <strong style={{ color: '#fff', marginRight: '6px' }}>{sym.name}</strong>
                      <span style={{ opacity: 0.6, fontFamily: 'monospace' }}>({sym.filePath}:{sym.line})</span>
                    </span>
                    <span style={{
                      fontSize: '8px',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      backgroundColor: '#37373d',
                      color: '#4ec9b0'
                    }}>{sym.type}</span>
                  </div>
                ))}
                {index.symbols.length === 0 && (
                  <span style={{ fontStyle: 'italic', color: '#666', padding: '8px' }}>No symbol declarations found</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '8px', opacity: 0.6, fontStyle: 'italic' }}>
          <span>Workspace index is empty</span>
          <span style={{ fontSize: '11px' }}>Click "Scan Project" to discover code structures and file symbols</span>
        </div>
      )}
    </div>
  );
};
