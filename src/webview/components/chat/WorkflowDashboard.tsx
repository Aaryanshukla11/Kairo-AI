import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const WorkflowDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'queue' | 'policies' | 'retries'>('timeline');

  useEffect(() => {
    const handleWorkflowUpdate = (msg: any) => {
      if (msg.type === MessageType.WORKFLOW_COORDINATOR_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.WORKFLOW_COORDINATOR_UPDATE, handleWorkflowUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.WORKFLOW_COORDINATOR_UPDATE, handleWorkflowUpdate);
    };
  }, []);

  const handleCoordinate = (strategy: string = 'Parallel') => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.WORKFLOW_COORDINATOR_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'COORDINATE_WORKFLOW',
        strategy
      },
      version: '1.0.0' as any
    });
  };

  return (
    <div style={{
      backgroundColor: 'var(--vscode-sideBar-background, #252526)',
      border: '1px solid var(--border, rgba(255,255,255,0.1))',
      borderRadius: '8px',
      padding: '14px',
      fontSize: '12px',
      color: '#d4d4d4',
      marginTop: '12px',
      textAlign: 'left'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))', paddingBottom: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>⚡</span>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Autonomous Workflow Coordinator</h4>
        </div>
        <button 
          onClick={() => handleCoordinate('Parallel')}
          disabled={loading}
          style={{
            background: 'var(--vscode-button-background, #007acc)',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '11px'
          }}
        >
          {loading ? 'Coordinating...' : 'Coordinate Workflow'}
        </button>
      </div>

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Key Metric Dials */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>{report.graph.stages.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Stages</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>{Math.round(report.executionConfidence * 100)}%</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dcdcaa' }}>{report.policyRules.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Policy Rules</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ce9178' }}>{report.retries.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Retries</div>
            </div>
          </div>

          {/* Validation Banner */}
          {report.validationResult && (
            <div style={{
              backgroundColor: report.validationResult.valid ? 'rgba(78, 201, 176, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              border: `1px solid ${report.validationResult.valid ? '#4ec9b0' : '#f44336'}`,
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{report.validationResult.valid ? '✓' : '⚠️'}</span>
              <span>{report.validationResult.valid ? 'Workflow Graph Validated (No deadlocks, deterministic execution).' : report.validationResult.errors.join('; ')}</span>
            </div>
          )}

          {/* Sub-tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'timeline' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'timeline' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'queue' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'queue' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Queue ({report.executionQueue.length})
            </button>
            <button
              onClick={() => setActiveTab('policies')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'policies' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'policies' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Policies ({report.policyRules.length})
            </button>
            <button
              onClick={() => setActiveTab('retries')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'retries' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'retries' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Retries ({report.retries.length})
            </button>
          </div>

          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.graph.stages.map((stg: any) => (
                <div key={stg.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#569cd6', fontSize: '11px' }}>{stg.id}: {stg.name}</span>
                    <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Engine: {stg.engine} | Deps: {stg.dependencies.length === 0 ? 'None' : stg.dependencies.join(', ')}</div>
                  </div>
                  <span style={{ backgroundColor: '#4ec9b0', color: '#000', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold' }}>
                    {stg.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Queue */}
          {activeTab === 'queue' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.executionQueue.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>Queue empty. All stages processed.</div>
              ) : (
                report.executionQueue.map((item: string, idx: number) => (
                  <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', color: '#4fc1ff' }}>
                    📥 Queue Item #{idx + 1}: {item}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Policies */}
          {activeTab === 'policies' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.policyRules.map((pol: any) => (
                <div key={pol.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span>🛡️ {pol.name} ({pol.type})</span>
                  <span style={{ color: '#4ec9b0', fontWeight: 600 }}>Enforced [{pol.severity}]</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Retries */}
          {activeTab === 'retries' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.retries.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No retry events recorded. Clean execution.</div>
              ) : (
                report.retries.map((ret: any) => (
                  <div key={ret.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', fontSize: '10px', color: '#ce9178' }}>
                    ⚠️ {ret.stageId}: Attempt {ret.attempt}/{ret.maxAttempts} [{ret.policy}]
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No workflow context active. Click Coordinate Workflow to dispatch lifecycle.
        </div>
      )}
    </div>
  );
};
