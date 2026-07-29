import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const SecurityCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleSecurityUpdate = (msg: any) => {
      if (msg.type === MessageType.SECURITY_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.SECURITY_UPDATE, handleSecurityUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.SECURITY_UPDATE, handleSecurityUpdate);
    };
  }, []);

  const handleRunScan = () => {
    setLoading(true);
    setErrorMsg('');

    // Construct mock execution plan containing some minor security risks for scanning
    const mockExecutionPlan = {
      id: 'plan-sec-123',
      goal: 'Configure database settings',
      tasks: [
        {
          id: 'task-1',
          title: 'Update config with SECRET_KEY credentials',
          type: 'Update',
          description: 'Set hardcoded secret password config key = "supersecret123"',
          dependencies: [],
          affectedFiles: ['src/config.ts']
        },
        {
          id: 'task-2',
          title: 'Execute chmod admin commands',
          type: 'Execute',
          description: 'Run chmod 777 on local workspace storage folders',
          dependencies: ['task-1'],
          affectedFiles: []
        }
      ]
    };

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.SECURITY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'SCAN_PLAN',
        plan: mockExecutionPlan
      },
      version: '1.0.0' as any
    });
  };

  const getPolicyColor = (policy: string) => {
    switch (policy) {
      case 'Block':
        return '#f44336';
      case 'Require Approval':
        return '#cca700';
      case 'Warn':
        return '#cca700';
      default:
        return '#4ec9b0';
    }
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Security Center</h4>
        <button 
          onClick={handleRunScan}
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
          {loading ? 'Scanning...' : 'Run Audit'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Risk and Policy Badge */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: report.riskScore > 40 ? '#f44336' : '#4ec9b0' }}>{report.riskScore}/100</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Risk Score</div>
            </div>
            <div style={{ flex: 1.5, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: getPolicyColor(report.policyResult), marginTop: '3px' }}>{report.policyResult}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Policy Decision</div>
            </div>
          </div>

          {/* Blocked Actions */}
          {report.blockedActions.length > 0 && (
            <div style={{ border: '1px solid #f44336', borderRadius: '4px', padding: '6px', backgroundColor: 'rgba(244,67,54,0.05)' }}>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Blocked Actions</h5>
              {report.blockedActions.map((act: string, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#ccc' }}>⛔ {act}</div>
              ))}
            </div>
          )}

          {/* Detected Issues */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Detected Issues</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
              {report.detectedIssues.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666' }}>No security issues detected.</div>
              ) : (
                report.detectedIssues.map((iss: any) => (
                  <div key={iss.id} style={{ fontSize: '10px', color: '#ccc', borderLeft: '2px solid #cca700', paddingLeft: '6px' }}>
                    <strong style={{ color: iss.severity === 'Critical' ? '#f44336' : '#cca700' }}>[{iss.severity}] {iss.title}</strong>
                    <div>{iss.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Recommendations</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {report.recommendations.map((r: string, idx: number) => (
                  <div key={idx} style={{ color: '#ccc', fontSize: '10px' }}>💡 {r}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No scan performed. Click Run Audit to evaluate risks.
        </div>
      )}
    </div>
  );
};
