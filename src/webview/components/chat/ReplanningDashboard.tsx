import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ReplanningDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'impact' | 'delta' | 'conflicts' | 'suggestions'>('impact');

  useEffect(() => {
    const handleReplanningUpdate = (msg: any) => {
      if (msg.type === MessageType.REPLANNING_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.REPLANNING_UPDATE, handleReplanningUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.REPLANNING_UPDATE, handleReplanningUpdate);
    };
  }, []);

  const handleReplan = (triggerType: string = 'TaskFailure') => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.REPLANNING_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'DYNAMIC_REPLAN',
        triggerType,
        failedSourceId: 'stg-03',
        strategy: 'Partial'
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
          <span style={{ fontSize: '14px' }}>🔄</span>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Dynamic Replanning Engine</h4>
        </div>
        <button 
          onClick={() => handleReplan('TaskFailure')}
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
          {loading ? 'Replanning...' : 'Trigger Replan'}
        </button>
      </div>

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Key Metric Dials */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>{report.impact.preservedTaskIds.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Preserved</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ce9178' }}>{report.impact.affectedTaskIds.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Affected</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>{Math.round(report.confidence * 100)}%</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dcdcaa' }}>{report.conflicts.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Conflicts</div>
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
              <span>{report.validationResult.valid ? 'Partial Replan Validated (Completed work preserved, zero orphaned tasks).' : report.validationResult.errors.join('; ')}</span>
            </div>
          )}

          {/* Sub-tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border, rgba(255,255,255,0.1))', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('impact')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'impact' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'impact' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Impact Summary
            </button>
            <button
              onClick={() => setActiveTab('delta')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'delta' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'delta' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Execution Delta
            </button>
            <button
              onClick={() => setActiveTab('conflicts')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'conflicts' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'conflicts' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Conflicts ({report.conflicts.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'suggestions' ? '2px solid #569cd6' : '2px solid transparent',
                color: activeTab === 'suggestions' ? '#fff' : '#888',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Suggestions ({report.recoverySuggestions.length})
            </button>
          </div>

          {/* Tab 1: Impact */}
          {activeTab === 'impact' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', fontSize: '10px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ color: '#888' }}>Trigger: </span>
                <strong style={{ color: '#ce9178' }}>{report.trigger.type}</strong> on stage <code>{report.trigger.sourceId}</code>
                <div style={{ fontStyle: 'italic', color: '#aaa', marginTop: '2px' }}>"{report.trigger.reason}"</div>
              </div>
              <div style={{ backgroundColor: 'rgba(78, 201, 176, 0.05)', border: '1px solid rgba(78, 201, 176, 0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ color: '#4ec9b0', fontWeight: 600 }}>🛡️ Preserved Stages: </span>
                <span>{report.impact.preservedTaskIds.join(', ') || 'None'}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                <span style={{ color: '#f44336', fontWeight: 600 }}>⚡ Affected Stages: </span>
                <span>{report.impact.affectedTaskIds.join(', ') || 'None'}</span>
              </div>
            </div>
          )}

          {/* Tab 2: Delta */}
          {activeTab === 'delta' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', fontSize: '10px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                <div style={{ color: '#569cd6', fontWeight: 600, marginBottom: '4px' }}>Updated Execution Order</div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {report.updatedExecutionOrder.map((id: string, idx: number) => (
                    <span key={idx} style={{ backgroundColor: report.impact.preservedTaskIds.includes(id) ? 'rgba(78, 201, 176, 0.2)' : 'rgba(0, 122, 204, 0.2)', color: report.impact.preservedTaskIds.includes(id) ? '#4ec9b0' : '#4fc1ff', padding: '2px 6px', borderRadius: '3px' }}>
                      {idx + 1}. {id} {report.impact.preservedTaskIds.includes(id) ? '✓' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Conflicts */}
          {activeTab === 'conflicts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', fontSize: '10px' }}>
              {report.conflicts.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: '#666' }}>No execution conflicts detected.</div>
              ) : (
                report.conflicts.map((conf: any) => (
                  <div key={conf.id} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
                    <div style={{ color: '#dcdcaa', fontWeight: 600 }}>⚔️ {conf.type}: {conf.description}</div>
                    <div style={{ color: '#4ec9b0', fontSize: '9px', marginTop: '2px' }}>Resolved: {conf.resolutionStrategy}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Suggestions */}
          {activeTab === 'suggestions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', fontSize: '10px' }}>
              {report.recoverySuggestions.map((sug: string, idx: number) => (
                <div key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', color: '#ccc' }}>
                  💡 {sug}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No replanning active. Click Trigger Replan to perform partial graph update.
        </div>
      )}
    </div>
  );
};
