import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const GenerationCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleGenerationUpdate = (msg: any) => {
      if (msg.type === MessageType.GENERATION_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.GENERATION_UPDATE, handleGenerationUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.GENERATION_UPDATE, handleGenerationUpdate);
    };
  }, []);

  const handleGenerateCode = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.GENERATION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_CODE',
        plan: {
          planId: 'plan-scaffold-1',
          title: 'Scaffold new agent controller components',
          language: 'typescript',
          targetPath: 'src/core/generated',
          tasks: [
            { id: 't1', desc: 'Create base files structures' }
          ]
        }
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Generation Center</h4>
        <button 
          onClick={handleGenerateCode}
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
          {loading ? 'Generating...' : 'Run Generator'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Status metrics dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>
                Completed
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Gen Status</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#569cd6', marginTop: '2px' }}>
                {artifact.strategyUsed}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Strategy Used</div>
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>⏱️ Duration: <strong>{artifact.metrics.durationMs} ms</strong></div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>📝 Lines Count: <strong>{artifact.metrics.linesCount} lines</strong></div>
            </div>
          </div>

          {/* Generated Files */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Generated Files & Symbols</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '8px', borderRadius: '3px' }}>
              {artifact.files.map((file: any, idx: number) => (
                <div key={idx} style={{ borderBottom: idx < artifact.files.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: '4px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '10px', color: '#4ec9b0', fontWeight: 'bold' }}>📄 {file.path}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {file.symbols.map((sym: any, sIdx: number) => (
                      <span key={sIdx} style={{ fontSize: '8px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 4px', borderRadius: '2px', color: '#aaa' }}>
                        ⚙️ {sym.name} ({sym.type})
                      </span>
                    ))}
                  </div>
                  <pre style={{ margin: '6px 0 0 0', padding: '4px', backgroundColor: '#000', color: '#fff', fontSize: '9px', overflowX: 'auto', borderRadius: '2px' }}>
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Warnings</h5>
            {artifact.warnings.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No policy warnings flagged. Code complies with guidelines.</div>
            ) : (
              artifact.warnings.map((w: string, idx: number) => (
                <div key={idx} style={{ color: '#f44336', fontSize: '10px' }}>⚠️ {w}</div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No code generation run. Trigger plan execution to transform plans to code.
        </div>
      )}
    </div>
  );
};
