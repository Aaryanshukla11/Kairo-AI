import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const NamingCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleNamingUpdate = (msg: any) => {
      if (msg.type === MessageType.NAMING_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.NAMING_UPDATE, handleNamingUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.NAMING_UPDATE, handleNamingUpdate);
    };
  }, []);

  const handleGenerateNames = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.NAMING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_NAMES',
        baseTerm: 'authCtrl',
        symbolType: 'Controller',
        casing: 'camelCase',
        existingFiles: ['userController.ts', 'authController.ts']
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Naming Center</h4>
        <button 
          onClick={handleGenerateNames}
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
          {loading ? 'Generating...' : 'Generate Names'}
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
                {(artifact.confidenceScore * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence score</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: artifact.collisionStatus === 'none' ? '#4ec9b0' : '#cca700', marginTop: '2px' }}>
                {artifact.collisionStatus.toUpperCase()}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Collision Status</div>
            </div>
          </div>

          {/* Generated name result */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Recommended Name</h5>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace', backgroundColor: '#1e1e1e', padding: '6px', borderRadius: '4px' }}>
              ✨ {artifact.symbolName}
            </div>
          </div>

          {/* Alternate Candidates list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Alternative Names</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid rgba(86,156,214,0.3)' }}>
              {artifact.alternativeNames.map((name: string, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#aaa', fontFamily: 'monospace' }}>
                  🔹 {name}
                </div>
              ))}
            </div>
          </div>

          {/* Naming rules compliance and reasoning summary */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px', color: '#888' }}>
            <span>Namespace: <strong style={{ color: '#ccc' }}>{artifact.namespace}</strong></span>
            <span>Reasoning: <span style={{ color: '#ccc' }}>Generated name is semantic, matches camelCase casing formats, checks language keywords, and scans workspace index files arrays to avoid duplicates.</span></span>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No generated names. Trigger naming recommendations to verify consistent styling.
        </div>
      )}
    </div>
  );
};
