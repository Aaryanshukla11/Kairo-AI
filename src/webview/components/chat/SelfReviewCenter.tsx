import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const SelfReviewCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleReviewUpdate = (msg: any) => {
      if (msg.type === MessageType.REVIEW_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.REVIEW_UPDATE, handleReviewUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.REVIEW_UPDATE, handleReviewUpdate);
    };
  }, []);

  const handleRunReview = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.REVIEW_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'RUN_REVIEW',
        targetFile: 'src/core/baseController.ts',
        fileContent: '// TODO: implement later\nconst badVar = "any";\n'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Self Review Center</h4>
        <button 
          onClick={handleRunReview}
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
          {loading ? 'Reviewing...' : 'Run Review'}
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
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: artifact.overallScore >= 80 ? '#4ec9b0' : '#cca700' }}>
                {artifact.overallScore}/100
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Overall Score</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>
                {artifact.riskLevel.toUpperCase()}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Risk Level</div>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Warnings / Failed Rules</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
              {artifact.warnings.map((warn: string, idx: number) => (
                <div key={idx} style={{ color: '#cca700' }}>⚠️ {warn}</div>
              ))}
              {artifact.failedChecks.map((fail: string, idx: number) => (
                <div key={idx} style={{ color: '#f44336' }}>❌ {fail}</div>
              ))}
              {artifact.warnings.length === 0 && artifact.failedChecks.length === 0 && (
                <div style={{ color: '#888', fontStyle: 'italic' }}>No warnings or checks failed.</div>
              )}
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4ec9b0' }}>Recommendations</h5>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: '#aaa' }}>
              {artifact.recommendations.map((rec: string, idx: number) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No review executed yet. Click Run Review to analyze findings.
        </div>
      )}
    </div>
  );
};
