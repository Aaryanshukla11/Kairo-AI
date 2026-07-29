import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const DebugCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleDebugUpdate = (msg: any) => {
      if (msg.type === MessageType.DEBUG_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.DEBUG_UPDATE, handleDebugUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.DEBUG_UPDATE, handleDebugUpdate);
    };
  }, []);

  const handleRunDiagnostics = () => {
    setLoading(true);
    setErrorMsg('');

    const mockDiagnostics = {
      errorName: 'TypeError',
      message: "Cannot read properties of undefined (reading 'executeTask')",
      stackTrace: `TypeError: Cannot read properties of undefined (reading 'executeTask')\n  at AgentRegistry.execute (src/core/agents/agentRegistry.ts:114:24)\n  at MessageRouter.handle (src/extension/messageRouter.ts:548:12)`,
      language: 'typescript',
      runtime: 'node',
      logs: [
        '[info] Received MESSAGE_REQUEST from bridge.',
        '[warn] Unregistered agent call dispatched.',
        '[error] Unhandled TypeError stack trace logged.'
      ]
    };

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.DEBUG_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ANALYZE_FAILURE',
        diagnostics: mockDiagnostics
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Debug Center</h4>
        <button 
          onClick={handleRunDiagnostics}
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
          {loading ? 'Analyzing...' : 'Run Diagnostics'}
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
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f44336' }}>{report.confidenceScore}%</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence</div>
            </div>
            <div style={{ flex: 2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#cca700', wordBreak: 'break-all', marginTop: '3px' }}>
                {report.affectedComponents.join(', ')}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Affected Modules</div>
            </div>
          </div>

          {/* Probable Root Cause */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Probable Root Cause</h5>
            <div style={{ fontSize: '10px', backgroundColor: 'rgba(244,67,54,0.08)', borderLeft: '3px solid #f44336', padding: '6px', borderRadius: '2px' }}>
              {report.probableRootCause}
            </div>
          </div>

          {/* Stack Trace */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Analyzed Stack Trace</h5>
            <pre style={{
              margin: 0,
              padding: '6px',
              backgroundColor: '#1e1e1e',
              border: '1px solid #333',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '9px',
              maxHeight: '80px',
              overflowY: 'auto',
              color: '#d4d4d4',
              whiteSpace: 'pre-wrap'
            }}>
              {`TypeError: Cannot read properties of undefined (reading 'executeTask')\n  at AgentRegistry.execute (src/core/agents/agentRegistry.ts:114:24)\n  at MessageRouter.handle (src/extension/messageRouter.ts:548:12)`}
            </pre>
          </div>

          {/* Related Logs */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Related Logs</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '60px', overflowY: 'auto', backgroundColor: '#181818', padding: '6px', borderRadius: '3px', border: '1px solid #282828' }}>
              <div style={{ fontSize: '9px', color: '#4ec9b0' }}>[info] Received MESSAGE_REQUEST from bridge.</div>
              <div style={{ fontSize: '9px', color: '#cca700' }}>[warn] Unregistered agent call dispatched.</div>
              <div style={{ fontSize: '9px', color: '#f44336' }}>[error] Unhandled TypeError stack trace logged.</div>
            </div>
          </div>

          {/* Alternative Hypotheses */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Formulated Hypotheses</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {report.alternativeHypotheses.map((h: any) => (
                <div key={h.id} style={{ fontSize: '10px', color: '#ccc' }}>
                  📌 <strong>Rank #{h.rank} ({h.confidence})</strong>: {h.description}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Next Actions */}
          {report.suggestedNextActions.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4ec9b0' }}>Suggested Next Actions</h5>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: '#ccc' }}>
                {report.suggestedNextActions.map((act: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No diagnostics scans ran. Trigger Scan to analyze failure stack traces.
        </div>
      )}
    </div>
  );
};
