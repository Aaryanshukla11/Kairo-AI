import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const RecoveryDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRecoveryUpdate = (msg: any) => {
      if (msg.type === MessageType.RECOVERY_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.RECOVERY_UPDATE, handleRecoveryUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.RECOVERY_UPDATE, handleRecoveryUpdate);
    };
  }, []);

  const handleRecover = (failureType: string = 'ExecutionFailure') => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RECOVERY_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'AUTONOMOUS_RECOVERY',
        failureType,
        failureMessage: 'Transient execution worker error detected',
        failedStageId: 'stg-03'
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
          <span style={{ fontSize: '14px' }}>🛡️</span>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Autonomous Recovery Engine</h4>
        </div>
        <button 
          onClick={() => handleRecover('ExecutionFailure')}
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
          {loading ? 'Recovering...' : 'Trigger Recovery'}
        </button>
      </div>

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Key Metric Dials */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>{report.recoveryState}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>State</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>{Math.round(report.confidence * 100)}%</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ce9178' }}>{report.rollbackStatus}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Rollback</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dcdcaa' }}>{report.recoveredTasks.length}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>Tasks Recovered</div>
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
              <span>{report.validationResult.valid ? 'Zero Data Loss Recovery Validated (Completed work preserved, rollback integrity verified).' : report.validationResult.errors.join('; ')}</span>
            </div>
          )}

          {/* Recovery Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
              <span style={{ color: '#888' }}>Failure Type: </span>
              <strong style={{ color: '#f44336' }}>{report.failureType}</strong>
              <div style={{ fontStyle: 'italic', color: '#aaa', marginTop: '2px' }}>"{report.failureMessage}"</div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
              <span style={{ color: '#888' }}>Selected Strategy: </span>
              <strong style={{ color: '#569cd6' }}>{report.strategy}</strong>
            </div>

            {report.checkpointUsed && (
              <div style={{ backgroundColor: 'rgba(78, 201, 176, 0.05)', border: '1px solid rgba(78, 201, 176, 0.2)', padding: '6px 8px', borderRadius: '4px' }}>
                <div style={{ color: '#4ec9b0', fontWeight: 600 }}>📍 Checkpoint Restored: {report.checkpointUsed.checkpointId}</div>
                <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>Snapshot: {report.checkpointUsed.workspaceSnapshot} | Status: {report.checkpointUsed.validationStatus}</div>
              </div>
            )}

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '4px' }}>
              <div style={{ color: '#4fc1ff', fontWeight: 600, marginBottom: '4px' }}>Recovered Execution Sequence</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {report.recoveredTasks.map((t: string, idx: number) => (
                  <span key={idx} style={{ backgroundColor: 'rgba(0, 122, 204, 0.2)', color: '#4fc1ff', padding: '2px 6px', borderRadius: '3px' }}>
                    {idx + 1}. {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No recovery event active. Click Trigger Recovery to execute state restoration.
        </div>
      )}
    </div>
  );
};
