import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const RefactoringCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleRefactorUpdate = (msg: any) => {
      if (msg.type === MessageType.REFACTORING_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.REFACTORING_UPDATE, handleRefactorUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.REFACTORING_UPDATE, handleRefactorUpdate);
    };
  }, []);

  const handleScanSmells = () => {
    setLoading(true);
    setErrorMsg('');

    // Send project file candidates for scanning smells
    const mockFilesList = [
      'src/extension/messageRouter.ts',
      'src/core/agents/agentRegistry.ts'
    ];

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.REFACTORING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ANALYZE_SMELLS',
        files: mockFilesList
      },
      version: '1.0.0' as any
    });
  };

  const getPriority = (risk: string) => {
    if (risk === 'High') return { text: 'HIGH PRIORITY', color: '#f44336' };
    if (risk === 'Medium') return { text: 'MEDIUM PRIORITY', color: '#cca700' };
    return { text: 'LOW PRIORITY', color: '#4ec9b0' };
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Refactoring Center</h4>
        <button 
          onClick={handleScanSmells}
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
          {loading ? 'Scanning...' : 'Scan Smells'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main Dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ec9b0' }}>{75 + report.maintainabilityGain}/100</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Maintainability</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: getPriority(report.behaviorRisk).color, marginTop: '3px' }}>
                {getPriority(report.behaviorRisk).text}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Action Priority</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: report.behaviorRisk === 'High' ? '#f44336' : '#cca700' }}>
                {report.behaviorRisk}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Behavior Risk</div>
            </div>
          </div>

          {/* Detected Smells */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Detected Smells</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
              {report.detectedIssues.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666' }}>No code smells detected.</div>
              ) : (
                report.detectedIssues.map((iss: any, idx: number) => (
                  <div key={idx} style={{ fontSize: '10px', color: '#ccc', borderLeft: '2px solid #569cd6', paddingLeft: '6px' }}>
                    <strong style={{ color: '#569cd6' }}>{iss.smell}</strong>
                    <div style={{ color: '#888', fontSize: '9px' }}>{iss.file.split('/').pop()}{iss.line ? ` : Line ${iss.line}` : ''}</div>
                    <div>{iss.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Suggested Refactoring Plans */}
          {report.suggestedImprovements.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Improvement Suggestions</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '80px', overflowY: 'auto' }}>
                {report.suggestedImprovements.map((s: string, idx: number) => (
                  <div key={idx} style={{ color: '#ccc', fontSize: '10px' }}>💡 {s}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No scans performed. Click Scan Smells to inspect code health.
        </div>
      )}
    </div>
  );
};
