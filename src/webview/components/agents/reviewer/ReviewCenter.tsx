import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const ReviewCenter: React.FC = () => {
  const [activeReport, setActiveReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const handleAgentUpdate = (msg: any) => {
      if (msg.type === MessageType.AGENT_UPDATE) {
        const { result, event } = msg.payload || {};
        if (result && result.report) {
          setActiveReport(result.report);
          setLoading(false);
        }
        if (event && event.type === 'ReviewFailed') {
          setErrorMsg(event.payload?.error || 'Review failed');
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
    };
  }, []);

  const handleTriggerReview = () => {
    setLoading(true);
    setErrorMsg('');
    setActiveReport(null);

    const mockPlanForReview = {
      id: 'plan-mock-123',
      goal: 'Integrate workspace file indexers',
      strategy: 'FeatureDevelopment',
      tasks: [
        { id: 'task-1', title: 'Delete core symbols maps', type: 'Delete', description: 'Clear symbols tables', dependencies: [], affectedFiles: [] },
        { id: 'task-2', title: 'Write symbol lists helpers', type: 'Create', description: 'Create file utilities', dependencies: ['task-1'], affectedFiles: ['src/utils.ts'] }
      ],
      affectedFiles: ['src/utils.ts', 'src/types.ts', 'src/events.ts', 'src/db.ts', 'src/api.ts', 'src/main.ts']
    };

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.AGENT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'DISPATCH',
        task: {
          id: `task-${Date.now()}`,
          title: 'Review Integrate workspace file indexers',
          assignedAgentId: 'reviewer-agent',
          payload: { plan: mockPlanForReview },
          status: 'pending'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Review Center dashboard</h4>
        <button 
          onClick={handleTriggerReview}
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
          {loading ? 'Reviewing...' : 'Review Mock Plan'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {activeReport ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1.2, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Health Summary</h5>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#4ec9b0' }}>{activeReport.overallScore}</span>
              <span style={{ fontSize: '11px', color: '#888' }}>overall score</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', marginTop: '4px' }}>
              <div>Risk Level: <strong style={{ color: activeReport.riskLevel === 'Low' ? '#4ec9b0' : '#f44336' }}>{activeReport.riskLevel}</strong></div>
              <div>Maintainability: <span>{activeReport.maintainabilityScore}/100</span></div>
              <div>Performance: <span>{activeReport.performanceScore}/100</span></div>
              <div>Security Score: <span>{activeReport.securityScore}/100</span></div>
              <div>Risk Score: <span>{activeReport.riskScore}/100</span></div>
            </div>
          </div>

          <div style={{ flex: 1.8, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeReport.warnings.length > 0 && (
              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Warnings</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '70px', overflowY: 'auto' }}>
                  {activeReport.warnings.map((w: string, i: number) => (
                    <div key={i} style={{ color: '#aaa', fontSize: '10px' }}>⚠️ {w}</div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h5 style={{ margin: '4px 0 4px 0', fontSize: '11px', color: '#cca700' }}>Recommendations</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '70px', overflowY: 'auto' }}>
                {activeReport.recommendations.map((r: string, i: number) => (
                  <div key={i} style={{ color: '#aaa', fontSize: '10px' }}>💡 {r}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No active report generated. Click Review Mock Plan to evaluate.
        </div>
      )}
    </div>
  );
};
