import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ValidationCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleValidationUpdate = (msg: any) => {
      if (msg.type === MessageType.VALIDATION_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.VALIDATION_UPDATE, handleValidationUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.VALIDATION_UPDATE, handleValidationUpdate);
    };
  }, []);

  const handleRunValidation = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.VALIDATION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'RUN_VALIDATION',
        targetFile: 'src/core/baseController.ts',
        fileContent: 'import { eval } from "vm";\n'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Validation Center</h4>
        <button 
          onClick={handleRunValidation}
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
          {loading ? 'Validating...' : 'Run Validation'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: artifact.overallStatus === 'Passed' ? '#4ec9b0' : '#f44336' }}>
                {artifact.overallStatus}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Overall Status</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#cca700' }}>
                {artifact.validationScore}/100
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Validation Score</div>
            </div>
          </div>

          {artifact.blockingIssues.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Blocking Issues</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
                {artifact.blockingIssues.map((issue: string, idx: number) => (
                  <div key={idx} style={{ color: '#f44336' }}>❌ {issue}</div>
                ))}
              </div>
            </div>
          )}

          {artifact.warnings.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Warnings</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
                {artifact.warnings.map((warn: string, idx: number) => (
                  <div key={idx} style={{ color: '#cca700' }}>⚠️ {warn}</div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Diagnostics Summary</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', color: '#aaa' }}>
              {artifact.diagnostics.length > 0 ? (
                artifact.diagnostics.map((diag: string, idx: number) => (
                  <div key={idx}>🔍 {diag}</div>
                ))
              ) : (
                <div style={{ fontStyle: 'italic', color: '#888' }}>All diagnostics passed.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No validation executed yet. Click Run Validation to start.
        </div>
      )}
    </div>
  );
};
