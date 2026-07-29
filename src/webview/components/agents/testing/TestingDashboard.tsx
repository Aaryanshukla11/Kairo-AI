import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const TestingDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleTestingUpdate = (msg: any) => {
      if (msg.type === MessageType.TESTING_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.TESTING_UPDATE, handleTestingUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.TESTING_UPDATE, handleTestingUpdate);
    };
  }, []);

  const handleRunTests = () => {
    setLoading(true);
    setErrorMsg('');
    
    // Construct mock execution report for test trigger
    const mockExecutionReport = {
      executionId: `exec-run-${Date.now()}`,
      planId: 'plan-123',
      completedTasks: ['task-1', 'task-2'],
      skippedTasks: [],
      failedTasks: [],
      executionTimeMs: 340,
      toolUsage: ['filesystem-tool', 'git-tool'],
      generatedArtifacts: [
        'src/core/agents/memory/memoryStore.ts',
        'src/core/agents/memory/memoryAgent.ts'
      ],
      logs: []
    };

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.TESTING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'RUN_WORKFLOW',
        executionReport: mockExecutionReport,
        framework: 'simulated'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Testing Dashboard</h4>
        <button 
          onClick={handleRunTests}
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
          {loading ? 'Running...' : 'Run Test Suite'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main Stats */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ec9b0' }}>{report.coverageEstimate}%</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Coverage</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#569cd6' }}>{report.confidenceScore}/100</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#cca700' }}>{report.durationMs}ms</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Duration</div>
            </div>
          </div>

          {/* Test Outcomes List */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Executed Tests</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
              {report.passedTests.map((t: string, idx: number) => (
                <div key={`pass-${idx}`} style={{ color: '#4ec9b0', fontSize: '10px' }}>✓ {t}</div>
              ))}
              {report.failedTests.map((t: string, idx: number) => (
                <div key={`fail-${idx}`} style={{ color: '#f44336', fontSize: '10px' }}>✗ {t}</div>
              ))}
              {report.skippedTests.map((t: string, idx: number) => (
                <div key={`skip-${idx}`} style={{ color: '#888', fontSize: '10px' }}>○ {t}</div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Warnings</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {report.warnings.map((w: string, idx: number) => (
                  <div key={idx} style={{ color: '#ccc', fontSize: '10px' }}>⚠️ {w}</div>
                ))}
              </div>
            </div>
          )}

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
          No tests executed. Click Run Test Suite to trigger validations.
        </div>
      )}
    </div>
  );
};
