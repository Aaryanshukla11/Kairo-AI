import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const SafeEditCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const handleSafeEditUpdate = (msg: any) => {
      if (msg.type === MessageType.SAFE_EDIT_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.SAFE_EDIT_UPDATE, handleSafeEditUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.SAFE_EDIT_UPDATE, handleSafeEditUpdate);
    };
  }, []);

  const handleEvaluateSafety = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.SAFE_EDIT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'EVALUATE_SAFETY',
        targetFile: 'src/core/baseController.ts',
        patchContent: '--- a/baseController.ts\n+++ b/baseController.ts\n+const x = 1;\n',
        userApproved: true
      },
      version: '1.0.0' as any
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSectionHeader = (title: string, sectionKey: string, indicator?: string) => {
    const isExpanded = expandedSection === sectionKey;
    return (
      <div 
        onClick={() => toggleSection(sectionKey)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          userSelect: 'none',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <span>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {indicator && <span style={{ color: '#4ec9b0', fontSize: '10px' }}>{indicator}</span>}
          <span>{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
    );
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Safe Edit Center</h4>
        <button 
          onClick={handleEvaluateSafety}
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
          {loading ? 'Evaluating...' : 'Evaluate Safety'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Status Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: (artifact.executionStatus === 'Approved' || artifact.executionStatus === 'Approved With Warning') ? '#4ec9b0' : '#cca700' }}>
                {artifact.executionStatus}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Execution Status</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: artifact.riskScore < 50 ? '#4ec9b0' : '#f44336' }}>
                {artifact.riskScore}/100 ({artifact.riskLevel || 'Minimal'})
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Risk Score & Level</div>
            </div>
          </div>

          {/* Section: Execution Context */}
          {renderSectionHeader('Execution Context', 'context', artifact.executionContext?.os)}
          {expandedSection === 'context' && artifact.executionContext && (
            <div style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <div>OS: <strong>{artifact.executionContext.os}</strong></div>
              <div>User: <strong>{artifact.executionContext.currentUser}</strong></div>
              <div>Branch: <strong>{artifact.executionContext.currentBranch}</strong></div>
              <div>Workspace status: <strong>{artifact.executionContext.workspaceStatus}</strong></div>
              <div>CPU Load: <strong>{Math.round(artifact.executionContext.cpuLoad * 100)}%</strong></div>
            </div>
          )}

          {/* Section: Simulation Results */}
          {renderSectionHeader('Simulation Results', 'simulation', artifact.simulationReport?.success ? 'Success' : 'Failed')}
          {expandedSection === 'simulation' && artifact.simulationReport && (
            <div style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <div>Success: <strong>{artifact.simulationReport.success ? 'True' : 'False'}</strong></div>
              <div>Duration: <strong>{artifact.simulationReport.durationMs}ms</strong></div>
              <div>AST Verification: <strong>{artifact.simulationReport.dryRunReport?.syntaxVerificationPassed ? 'Passed' : 'Failed'}</strong></div>
              <div>Imports: <strong>{artifact.simulationReport.dryRunReport?.importsVerified ? 'Verified' : 'Invalid'}</strong></div>
              {artifact.simulationReport.error && <div style={{ color: '#f44336' }}>Error: {artifact.simulationReport.error}</div>}
            </div>
          )}

          {/* Section: Risk Graph */}
          {renderSectionHeader('Risk Graph', 'riskGraph', `${artifact.riskGraph?.overallRiskLevel || 'Minimal'}`)}
          {expandedSection === 'riskGraph' && artifact.riskGraph && (
            <div style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              {Object.entries(artifact.riskGraph.categories).map(([cat, info]: any) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '2px 0' }}>
                  <span>{cat.toUpperCase()}:</span>
                  <span style={{ color: info.score > 50 ? '#f44336' : '#4ec9b0' }}>{info.score}/100 ({info.severity})</span>
                </div>
              ))}
            </div>
          )}

          {/* Section: Rollback readiness & Certificate */}
          {renderSectionHeader('Rollback Readiness', 'rollback', artifact.rollbackCertificate?.verificationResult)}
          {expandedSection === 'rollback' && artifact.rollbackCertificate && (
            <div style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <div>Certificate ID: <strong>{artifact.rollbackCertificate.certificateId}</strong></div>
              <div>Result: <strong>{artifact.rollbackCertificate.verificationResult}</strong></div>
              <div>Est. Time: <strong>{artifact.rollbackCertificate.estimatedRollbackTimeMs}ms</strong></div>
              <div>Confidence: <strong>{Math.round(artifact.rollbackCertificate.rollbackConfidence * 100)}%</strong></div>
            </div>
          )}

          {/* Section: Execution Confidence */}
          {renderSectionHeader('Execution Confidence', 'confidence', `Grade ${artifact.confidenceReport?.grade || 'A'}`)}
          {expandedSection === 'confidence' && artifact.confidenceReport && (
            <div style={{ padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <div>Overall: <strong>{Math.round(artifact.confidenceReport.overallConfidence * 100)}%</strong></div>
              <div>Recommendation: <strong>{artifact.confidenceReport.recommendation}</strong></div>
              {artifact.confidenceReport.evidence.map((ev: any, i: number) => (
                <div key={i} style={{ fontSize: '10px', color: '#aaa', paddingLeft: '4px' }}>
                  • {ev.factor}: {ev.description}
                </div>
              ))}
            </div>
          )}

          {/* Core recommendation footer */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '10px', color: '#888' }}>
            <span>Recommendation: <strong>{artifact.executionRecommendation}</strong></span>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No safety evaluation run. Click Evaluate Safety to check execution gates.
        </div>
      )}
    </div>
  );
};
