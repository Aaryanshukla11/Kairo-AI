import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const MilestoneDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'parallel' | 'checkpoints' | 'recovery'>('timeline');

  useEffect(() => {
    const handleMilestoneUpdate = (msg: any) => {
      if (msg.type === MessageType.MILESTONE_ORCHESTRATION_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.MILESTONE_ORCHESTRATION_UPDATE, handleMilestoneUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.MILESTONE_ORCHESTRATION_UPDATE, handleMilestoneUpdate);
    };
  }, []);

  const handleOrchestrate = (strategy: string = 'Hybrid') => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MILESTONE_ORCHESTRATION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ORCHESTRATE_MILESTONES',
        strategy
      },
      version: '1.0.0' as any
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4ec9b0';
      case 'Running': return '#569cd6';
      case 'Planned': return '#cca700';
      case 'Failed': return '#f44336';
      case 'RolledBack': return '#ce9178';
      default: return '#888888';
    }
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
          <span style={{ fontSize: '14px' }}>🎯</span>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Milestone Orchestration</h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => handleOrchestrate('Hybrid')}
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
            {loading ? 'Orchestrating...' : 'Run Orchestration'}
          </button>
        </div>
      </div>

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* High-level metrics */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>{report.metrics.totalMilestones}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Milestones</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>{Math.round(report.executionConfidence * 100)}%</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dcdcaa' }}>{report.checkpoints.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Checkpoints</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ce9178' }}>{report.recoveryPlans.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Recovery Plans</div>
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
              <span>{report.validationResult.valid ? 'Milestone Workflow Validated (No cycles, complete task coverage).' : report.validationResult.errors.join('; ')}</span>
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
              Timeline ({report.workflow.milestones.length})
            </button>
            <button
              onClick={() => setActiveTab('parallel')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'parallel' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'parallel' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Parallel Groups
            </button>
            <button
              onClick={() => setActiveTab('checkpoints')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'checkpoints' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'checkpoints' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Checkpoints ({report.checkpoints.length})
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'recovery' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'recovery' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Recovery ({report.recoveryPlans.length})
            </button>
          </div>

          {/* Tab 1: Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.workflow.milestones.map((m: any) => (
                <div key={m.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#569cd6', fontSize: '11px' }}>{m.id}: {m.title}</span>
                    <span style={{ backgroundColor: getStatusBadgeColor(m.status), color: '#000', padding: '1px 5px', borderRadius: '3px', fontSize: '9px', fontWeight: 'bold' }}>
                      {m.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>{m.description}</div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '9px', color: '#777' }}>
                    <span>Tasks: <strong>{m.tasks.join(', ')}</strong></span>
                    <span>Deps: <strong>{m.dependencies.length === 0 ? 'None' : m.dependencies.join(', ')}</strong></span>
                    <span>Conf: <strong>{Math.round(m.confidence * 100)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Parallel Groups */}
          {activeTab === 'parallel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.workflow.parallelMilestones.map((group: string[], idx: number) => (
                <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Stage {idx + 1} Execution Group</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {group.map(id => (
                      <div key={id} style={{ backgroundColor: 'rgba(0,122,204,0.2)', border: '1px solid #007acc', color: '#4fc1ff', padding: '2px 6px', borderRadius: '3px', fontSize: '10px' }}>
                        🏁 {id}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Checkpoints */}
          {activeTab === 'checkpoints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.checkpoints.map((cp: any) => (
                <div key={cp.checkpointId} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', fontSize: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dcdcaa', fontWeight: 600 }}>
                    <span>📌 {cp.checkpointId}</span>
                    <span style={{ color: cp.verificationStatus === 'Verified' ? '#4ec9b0' : '#f44336' }}>{cp.verificationStatus}</span>
                  </div>
                  <div style={{ color: '#888', fontSize: '9px', marginTop: '2px' }}>
                    Milestone: {cp.milestoneId} | Snapshot: {cp.workspaceSnapshot}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Recovery Plans */}
          {activeTab === 'recovery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {report.recoveryPlans.map((rec: any) => (
                <div key={rec.recoveryPlanId} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', fontSize: '10px' }}>
                  <div style={{ color: '#ce9178', fontWeight: 600 }}>🛡️ {rec.recoveryPlanId} (Rollback: {rec.rollbackBoundaryId})</div>
                  <div style={{ color: '#aaa', fontSize: '9px', marginTop: '2px' }}>
                    Retries: {rec.retryCount}/{rec.maxRetries} | Confidence: {Math.round(rec.recoveryConfidence * 100)}%
                  </div>
                  <div style={{ fontStyle: 'italic', color: '#777', fontSize: '9px', marginTop: '2px' }}>
                    Fallbacks: {rec.fallbackSteps.join(' ➔ ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No orchestration loaded. Click Run Orchestration to generate milestone workflow.
        </div>
      )}
    </div>
  );
};
