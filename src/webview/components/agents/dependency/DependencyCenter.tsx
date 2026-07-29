import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const DependencyCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleDependencyUpdate = (msg: any) => {
      if (msg.type === MessageType.DEPENDENCY_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.DEPENDENCY_UPDATE, handleDependencyUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.DEPENDENCY_UPDATE, handleDependencyUpdate);
    };
  }, []);

  const handleScanDependencies = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.DEPENDENCY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ANALYZE_DEPENDENCIES',
        packageJsonPath: 'package.json'
      },
      version: '1.0.0' as any
    });
  };

  const getHealthColor = (level: string) => {
    if (level === 'Healthy') return '#4ec9b0';
    if (level === 'Stable') return '#569cd6';
    if (level === 'Warning') return '#cca700';
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Dependency Center</h4>
        <button 
          onClick={handleScanDependencies}
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
          {loading ? 'Scanning...' : 'Scan Dependencies'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main score dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: getHealthColor(report.healthLevel) }}>
                {report.compatibilityScore}%
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Compatibility</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: getHealthColor(report.healthLevel), marginTop: '3px' }}>
                {report.healthLevel.toUpperCase()}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Health status</div>
            </div>
          </div>

          {/* Licenses Summary */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Licenses Summary</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {Object.entries(report.licenseSummary).map(([lic, count]) => (
                <div key={lic} style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 6px', borderRadius: '3px', fontSize: '9px', color: '#ccc' }}>
                  📜 {lic}: <strong>{count as any}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Dependency Graph list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Ecosystem Nodes</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '80px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '6px', borderRadius: '3px' }}>
              {report.nodes.map((node: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: node.isDev ? '#888' : '#d4d4d4' }}>
                  📦 {node.name} <span style={{ fontSize: '9px', color: '#569cd6' }}>({node.version})</span> {node.isDev ? '[dev]' : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Circular Dependencies */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Circular Import Cycles</h5>
            {report.circularDependencies.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No cycles detected.</div>
            ) : (
              report.circularDependencies.map((cycle: string[], idx: number) => (
                <div key={idx} style={{ color: '#f44336', fontSize: '10px' }}>
                  ⚠️ Cycle: {cycle.join(' ➔ ')}
                </div>
              ))
            )}
          </div>

          {/* Version Conflicts */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Version Conflicts</h5>
            {report.versionConflicts.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No version conflicts.</div>
            ) : (
              report.versionConflicts.map((conf: any, idx: number) => (
                <div key={idx} style={{ color: '#cca700', fontSize: '10px' }}>
                  ⚠️ {conf.packageName}: resolves {conf.resolved} but requires {conf.required}
                </div>
              ))
            )}
          </div>

          {/* Upgrade Recommendations */}
          {report.recommendations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#4ec9b0' }}>Ecosystem Guidelines</h5>
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
          No scan performed. Click Scan Dependencies to check imports health.
        </div>
      )}
    </div>
  );
};
