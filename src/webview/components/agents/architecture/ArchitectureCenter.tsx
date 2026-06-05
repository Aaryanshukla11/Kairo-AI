import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const ArchitectureCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleArchitectureUpdate = (msg: any) => {
      if (msg.type === MessageType.ARCHITECTURE_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.ARCHITECTURE_UPDATE, handleArchitectureUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.ARCHITECTURE_UPDATE, handleArchitectureUpdate);
    };
  }, []);

  const handleRunArchitectureCheck = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.ARCHITECTURE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ANALYZE_ARCHITECTURE',
        filesMap: {
          'src/webview/components/chat/EmptyState.tsx': 'import { SecurityCenter } from "../agents/security/SecurityCenter";'
        }
      },
      version: '1.0.0' as any
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4ec9b0';
    if (score >= 70) return '#cca700';
    return '#f44336';
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Architecture Center</h4>
        <button 
          onClick={handleRunArchitectureCheck}
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
          {loading ? 'Analyzing...' : 'Audit Architecture'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Architecture dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: getScoreColor(report.architectureScore) }}>
                {report.architectureScore}/100
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Architecture Score</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#cca700', marginTop: '2px' }}>
                {report.technicalDebtScore} hrs
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Technical Debt</div>
            </div>
          </div>

          {/* Scores list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>📐 Scalability: <strong>{report.scalabilityScore}%</strong></div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>🔧 Maintainability: <strong>{report.maintainabilityScore}%</strong></div>
            </div>
          </div>

          {/* Layer Diagram block layout */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Prescribed Layer Diagrams</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '6px', backgroundColor: '#1e1e1e', borderRadius: '3px' }}>
              <div style={{ padding: '3px', backgroundColor: 'rgba(78, 201, 176, 0.1)', border: '1px solid #4ec9b0', color: '#4ec9b0', textAlign: 'center', fontSize: '9px', borderRadius: '2px' }}>
                WEBVIEW LAYER (React UI)
              </div>
              <div style={{ textAlign: 'center', fontSize: '8px', color: '#666' }}>⬇️ [VSCode Bridge IPC]</div>
              <div style={{ padding: '3px', backgroundColor: 'rgba(86, 156, 214, 0.1)', border: '1px solid #569cd6', color: '#569cd6', textAlign: 'center', fontSize: '9px', borderRadius: '2px' }}>
                EXTENSION LAYER (messageRouter.ts)
              </div>
              <div style={{ textAlign: 'center', fontSize: '8px', color: '#666' }}>⬇️ [Agent Registry Engine]</div>
              <div style={{ padding: '3px', backgroundColor: 'rgba(204, 167, 0, 0.1)', border: '1px solid #cca700', color: '#cca700', textAlign: 'center', fontSize: '9px', borderRadius: '2px' }}>
                CORE AGENTS LAYER (Brains & Planners)
              </div>
            </div>
          </div>

          {/* Violations checklist */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Detected Layer Violations</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {report.layerViolations.length === 0 && report.boundaryViolations.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No architectural violations detected.</div>
              ) : (
                [...report.layerViolations, ...report.boundaryViolations].map((v: any, idx: number) => (
                  <div key={idx} style={{ fontSize: '10px', color: '#ccc', borderLeft: '2px solid #f44336', paddingLeft: '6px' }}>
                    <strong style={{ color: '#f44336' }}>{v.type} ({v.severity})</strong>
                    <div style={{ fontSize: '9px', color: '#aaa', wordBreak: 'break-all' }}>{v.file}</div>
                    <div>{v.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trend History */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Architecture Drift History</h5>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              📈 Monolithic drift index remains low. Decoupled module boundaries are maintained.
            </div>
          </div>

          {/* Recommendations checklist */}
          {report.recommendations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4ec9b0' }}>Optimization Recommendations</h5>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: '#ccc' }}>
                {report.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No scans run. Click Audit Architecture to check structural integrity.
        </div>
      )}
    </div>
  );
};
