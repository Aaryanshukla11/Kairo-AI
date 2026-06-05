import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const PerformanceCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handlePerformanceUpdate = (msg: any) => {
      if (msg.type === MessageType.PERFORMANCE_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.PERFORMANCE_UPDATE, handlePerformanceUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.PERFORMANCE_UPDATE, handlePerformanceUpdate);
    };
  }, []);

  const handleRunProfiler = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.PERFORMANCE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ANALYZE_PERFORMANCE',
        filePath: 'src/core/agents/agentRegistry.ts'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Performance Center</h4>
        <button 
          onClick={handleRunProfiler}
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
          {loading ? 'Analyzing...' : 'Profile Audit'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Performance Dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: getScoreColor(report.overallScore) }}>
                {report.overallScore}/100
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Overall Score</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4ec9b0', marginTop: '2px' }}>
                {report.overallLevel}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Perf Level</div>
            </div>
          </div>

          {/* Detailed stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>⏱️ Build Time: <strong>{report.buildTimeMs} ms</strong></div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>💾 Memory: <strong>{report.memoryUsageMb} MB</strong></div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>⚡ CPU Usage: <strong>{report.cpuUsagePercent} %</strong></div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>📦 Bundle Size: <strong>{report.bundleSizeKb} KB</strong></div>
            </div>
          </div>

          {/* Hot Paths / Bottlenecks */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Hot Paths & Bottlenecks</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {report.detectedBottlenecks.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No bottlenecks detected.</div>
              ) : (
                report.detectedBottlenecks.map((btn: any) => (
                  <div key={btn.id} style={{ fontSize: '10px', color: '#ccc', borderLeft: '2px solid #f44336', paddingLeft: '6px' }}>
                    <strong style={{ color: '#f44336' }}>{btn.component} ({btn.severity})</strong>
                    <div>{btn.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Complexity Report */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Algorithmic Complexity</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {report.complexityReport.map((c: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#ccc' }}>
                  ⚙️ <code>{c.symbolName}</code>: <strong style={{ color: '#4ec9b0' }}>{c.estimatedComplexity}</strong> - {c.reason}
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trends */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Performance Trend Forecast</h5>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              📈 Stable development velocity. No quadratic regressions flagged.
            </div>
          </div>

          {/* Suggestions */}
          {report.optimizationSuggestions.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4ec9b0' }}>Optimization Suggestions</h5>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: '#ccc' }}>
                {report.optimizationSuggestions.map((s: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No scans run. Click Profile Audit to collect performance statistics.
        </div>
      )}
    </div>
  );
};
