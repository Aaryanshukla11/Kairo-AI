import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const SymbolResolutionCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleSymbolUpdate = (msg: any) => {
      if (msg.type === MessageType.SYMBOL_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.SYMBOL_UPDATE, handleSymbolUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.SYMBOL_UPDATE, handleSymbolUpdate);
    };
  }, []);

  const handleResolveSymbols = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.SYMBOL_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'RESOLVE_SYMBOLS',
        targetFile: 'src/core/baseController.ts',
        fileContent: 'export class BaseController {}\nexport interface IBaseController {}\n',
        requiredSymbols: ['Base', 'Agent']
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Symbol Resolution Center</h4>
        <button 
          onClick={handleResolveSymbols}
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
          {loading ? 'Resolving...' : 'Resolve Symbols'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main indicators dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>
                {(artifact.confidence * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence score</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>
                {artifact.resolvedSymbols.length}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Resolved symbols</div>
            </div>
          </div>

          {/* Resolved symbols list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Resolved Symbols definitions</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '6px', borderRadius: '3px' }}>
              {artifact.resolvedSymbols.map((sym: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', borderBottom: idx < artifact.resolvedSymbols.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: '2px', marginBottom: '2px' }}>
                  <span>💎 <strong style={{ color: '#fff' }}>{sym.name}</strong> ({sym.kind})</span>
                  <span style={{ color: '#888', fontSize: '9px' }}>{sym.visibility}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Namespace Hierarchy details */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Namespace Scope Context</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', color: '#aaa' }}>
              {artifact.namespaceInfo.map((ns: string, idx: number) => (
                <div key={idx}>📦 {ns}</div>
              ))}
            </div>
          </div>

          {/* Reference Graph edges list */}
          {artifact.referenceGraph.edges.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Reference Graph connections</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9px', color: '#aaa', paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                {artifact.referenceGraph.edges.map((edge: any, idx: number) => (
                  <div key={idx}>🔗 {edge.from} ➔ {edge.to}</div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostics summary */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '10px', color: '#888' }}>
            <span>Diagnostics Status: <strong style={{ color: '#4ec9b0' }}>No Ambiguities</strong></span>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No symbols resolved. Click Resolve Symbols to map symbol references.
        </div>
      )}
    </div>
  );
};
