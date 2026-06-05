import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const PlannerInspector: React.FC = () => {
  const [promptInput, setPromptInput] = useState<string>('Create a new React sidebar panel widget');
  const [activePlan, setActivePlan] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({
    plansGeneratedCount: 0,
    totalPlanningTimeMs: 0,
    averageTasksPerPlan: 0,
    lastPlanLatencyMs: 0
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const handleAgentUpdate = (msg: any) => {
      if (msg.type === MessageType.AGENT_UPDATE) {
        const { result, event } = msg.payload || {};
        if (result && result.plan) {
          setActivePlan(result.plan);
          if (result.metrics) setMetrics(result.metrics);
          setLoading(false);
        }
        if (event && event.type === 'PlanningFailed') {
          setErrorMsg(event.payload?.error || 'Planning failed');
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.AGENT_UPDATE, handleAgentUpdate);
    };
  }, []);

  const handleGeneratePlan = () => {
    setLoading(true);
    setErrorMsg('');
    setActivePlan(null);
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
          title: `Compile plan for: ${promptInput}`,
          assignedAgentId: 'planner-agent',
          payload: { text: promptInput },
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
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Planner Inspector Panel</h4>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Enter goal or prompt for plan..."
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: '#fff',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            padding: '4px',
            fontSize: '11px'
          }}
        />
        <button 
          onClick={handleGeneratePlan}
          disabled={loading}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '3px',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '11px'
          }}
        >
          {loading ? 'Planning...' : 'Generate Plan'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px', padding: '4px 0' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {activePlan && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <div style={{ flex: 1.2, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h5 style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#888' }}>Goal details</h5>
            <div style={{ fontWeight: 600, color: '#4ec9b0' }}>{activePlan.goal}</div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>{activePlan.summary}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '11px' }}>
              <div>Strategy: <strong>{activePlan.strategy}</strong></div>
              <div>Priority: <strong>{activePlan.priority}</strong></div>
              <div>Duration: <span>{activePlan.estimatedDurationMin} mins</span></div>
              <div>Complexity: <span style={{ color: '#cca700' }}>{activePlan.riskAssessment.complexity}</span></div>
              <div>Risk Score: <span>{activePlan.riskAssessment.riskScore}/100</span></div>
            </div>
          </div>

          <div style={{ flex: 1.8, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h5 style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#888' }}>Execution Graph Preview</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {activePlan.tasks.map((t: any) => (
                <div key={t.id} style={{
                  padding: '5px',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: '2px solid var(--vscode-button-background)'
                }}>
                  <div style={{ fontWeight: 600 }}>{t.title} <span style={{ color: '#888', fontSize: '10px' }}>({t.type})</span></div>
                  <div style={{ color: '#aaa', fontSize: '10px', marginTop: '2px' }}>{t.description}</div>
                  {t.dependencies.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>
                      Depends on: {t.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '10px', color: '#666' }}>
        <span>Plans generated: {metrics.plansGeneratedCount}</span>
        <span>Avg tasks/plan: {metrics.averageTasksPerPlan.toFixed(1)}</span>
        <span>Last latency: {metrics.lastPlanLatencyMs}ms</span>
      </div>
    </div>
  );
};
