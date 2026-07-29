import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ExecutionPlannerDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'checkpoints' | 'resources'>('timeline');

  useEffect(() => {
    const handleExecutionPlanningUpdate = (msg: any) => {
      if (msg.type === MessageType.EXECUTION_PLANNING_UPDATE as any) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.EXECUTION_PLANNING_UPDATE as any, handleExecutionPlanningUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.EXECUTION_PLANNING_UPDATE as any, handleExecutionPlanningUpdate);
    };
  }, []);

  const handlePlanExecution = () => {
    setLoading(true);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.EXECUTION_PLANNING_REQUEST as any,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'PLAN_EXECUTION'
      },
      version: '1.0.0' as any
    });
  };

  const plan = report?.executionPlan;

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Execution Planner</h4>
        <button 
          onClick={handlePlanExecution}
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
          {loading ? 'Planning...' : 'Plan Execution'}
        </button>
      </div>

      {plan ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Strategy & Risk Row */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4ec9b0' }}>
                {plan.strategy}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Execution Strategy</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#cca700' }}>
                {plan.schedule.totalTimeSlots} slots
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Time Slots</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: plan.overallRisk === 'High' || plan.overallRisk === 'Critical' ? '#f44336' : '#4ec9b0' }}>
                {plan.overallRisk}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Plan Risk</div>
            </div>
          </div>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{
                background: activeTab === 'timeline' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'timeline' ? '#fff' : '#888',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Timeline & Groups
            </button>
            <button
              onClick={() => setActiveTab('checkpoints')}
              style={{
                background: activeTab === 'checkpoints' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'checkpoints' ? '#fff' : '#888',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Checkpoints ({plan.checkpointPlan.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              style={{
                background: activeTab === 'resources' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === 'resources' ? '#fff' : '#888',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Resource Allocation
            </button>
          </div>

          {/* Tab Content: Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              <div style={{ color: '#888', fontWeight: 600 }}>Parallel Groups & Execution Sequence:</div>
              {plan.schedule.parallelGroups.map((group: string[], gIdx: number) => (
                <div key={gIdx} style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#9cdcfe', marginBottom: '4px' }}>Time Slot {gIdx + 1} ({group.length} concurrent step{group.length > 1 ? 's' : ''})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {group.map((stepId: string) => {
                      const step = plan.schedule.steps.find((s: any) => s.stepId === stepId);
                      return (
                        <div key={stepId} style={{ display: 'flex', justifyContent: 'space-between', color: '#ddd' }}>
                          <span>• {stepId}: {step?.taskTitle || 'Task Step'}</span>
                          <span style={{ color: '#888' }}>Worker #{step?.workerIndex ?? 0} | {step?.estimatedDurationMs}ms</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content: Checkpoints & Rollbacks */}
          {activeTab === 'checkpoints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
              <div style={{ color: '#888', fontWeight: 600 }}>Checkpoint & Rollback Boundaries:</div>
              {plan.checkpointPlan.map((cp: any, cIdx: number) => {
                const rb = plan.rollbackBoundaries.find((b: any) => b.checkpointId === cp.checkpointId);
                return (
                  <div key={cIdx} style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '6px' }}>
                    <div style={{ fontWeight: 'bold', color: '#4ec9b0' }}>{cp.checkpointId} (Snapshot: {cp.workspaceSnapshot.substr(0, 16)}...)</div>
                    <div>Rollback Boundary: <strong style={{ color: '#f44336' }}>{cp.rollbackBoundary}</strong></div>
                    <div>Affected Files: <strong>{rb?.affectedFiles?.length || 0} file(s)</strong></div>
                    <div style={{ color: '#aaa', fontStyle: 'italic', marginTop: '2px' }}>Verification: {cp.verificationRules[0]}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Content: Resource Allocation */}
          {activeTab === 'resources' && (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Max Workers: <strong>{plan.resourcePlan.maxConcurrentWorkers} workers</strong></div>
              <div>Memory Limit: <strong>{plan.resourcePlan.memoryLimitMB} MB</strong></div>
              <div>CPU Cap: <strong>{plan.resourcePlan.cpuLimitPercent}%</strong></div>
              <div>Est. Tokens: <strong>{plan.resourcePlan.estimatedTokens} tokens</strong></div>
              <div>Est. Runtime: <strong>{Math.round(plan.resourcePlan.estimatedRuntimeMs / 1000)} seconds</strong></div>
              <div>Context Window: <strong>{plan.resourcePlan.contextWindowTokens} tokens</strong></div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No execution plan generated. Click Plan Execution to generate the execution plan.
        </div>
      )}
    </div>
  );
};
export default ExecutionPlannerDashboard;
