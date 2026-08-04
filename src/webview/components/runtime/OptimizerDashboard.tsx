import React, { useState } from 'react';

export const OptimizerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'scheduler' | 'timeline'>('status');
  const [optState, setOptState] = useState<any>({
    optimizerType: 'AdamW',
    learningRate: 0.00095,
    stepCount: 150,
    momentum: 0.9,
    movingAverageSq: 0.999,
    weightDecay: 0.01,
    gradientNorm: 0.354,
    updatesNorm: 0.000336,
    scheduler: {
      type: 'Cosine',
      warmupSteps: 50,
      totalSteps: 1000,
      status: 'Active (Step 150/1000)'
    },
    timeline: [
      { step: 120, lr: 0.001, updatesNorm: 0.00035, globalNorm: 0.35 },
      { step: 130, lr: 0.00098, updatesNorm: 0.00034, globalNorm: 0.35 },
      { step: 140, lr: 0.00096, updatesNorm: 0.00034, globalNorm: 0.35 },
      { step: 150, lr: 0.00095, updatesNorm: 0.00033, globalNorm: 0.35 }
    ]
  });

  const [testSchedule, setTestSchedule] = useState<string>('Cosine');
  const [testLr, setTestLr] = useState<number>(0.001);

  const handleUpdateTest = () => {
    setOptState((prev: any) => ({
      ...prev,
      learningRate: testLr,
      scheduler: {
        ...prev.scheduler,
        type: testSchedule
      },
      timeline: [
        { step: prev.stepCount + 10, lr: testLr, updatesNorm: prev.gradientNorm * testLr, globalNorm: prev.gradientNorm },
        ...prev.timeline
      ],
      stepCount: prev.stepCount + 10
    }));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(28, 20, 38, 0.96) 0%, rgba(14, 10, 20, 0.98) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.42)',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
              Optimizer Runtime Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M07-S01-T004
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Monitoring learning rate schedules decays, state parameter steps counters, momentum tracking, and parameter updates ratios
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11px' }}>
          <span>Sched:</span>
          <select
            value={testSchedule}
            onChange={(e) => setTestSchedule(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px'
            }}
          >
            <option value="Constant">Constant</option>
            <option value="Linear">Linear</option>
            <option value="Cosine">Cosine</option>
            <option value="Exponential">Exponential</option>
            <option value="Step Decay">Step Decay</option>
          </select>
          <input
            type="number"
            value={testLr}
            step="0.0001"
            onChange={(e) => setTestLr(parseFloat(e.target.value) || 0.001)}
            style={{
              width: '70px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              borderRadius: '4px',
              padding: '2px 4px',
              fontSize: '11px'
            }}
          />
          <button
            onClick={handleUpdateTest}
            style={{
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Trigger Step
          </button>
        </div>
      </div>

      {/* Main Aggregates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Active Optimizer</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa' }}>{optState.optimizerType}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Learning Rate</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f472b6' }}>{optState.learningRate.toFixed(6)}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Updates Norm</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>{optState.updatesNorm.toFixed(6)}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Step Count</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#fb7185' }}>{optState.stepCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['status', 'scheduler', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#a78bfa' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Optimizer State Telemetry</span>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#cbd5e1' }}>
            <div>Momentum (Beta 1): {optState.momentum}</div>
            <div>Moving Average Sq (Beta 2): {optState.movingAverageSq}</div>
            <div>Weight Decay: {optState.weightDecay}</div>
            <div>Gradient Norm: {optState.gradientNorm}</div>
          </div>
        </div>
      )}

      {activeTab === 'scheduler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Scheduler Status</span>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '11px' }}>
            <div style={{ marginBottom: '6px' }}>Scheduler Type: <strong style={{ color: '#a78bfa' }}>{optState.scheduler.type}</strong></div>
            <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>Warmup Steps: {optState.scheduler.warmupSteps}</div>
            <div style={{ color: '#94a3b8' }}>Status: {optState.scheduler.status}</div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Optimization History Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {optState.timeline.map((t: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>Step {t.step}</span>
                <span style={{ color: '#f472b6' }}>LR: {t.lr.toFixed(6)}</span>
                <span style={{ color: '#38bdf8' }}>Updates Norm: {t.updatesNorm.toFixed(6)}</span>
                <span style={{ color: '#94a3b8' }}>Grad Norm: {t.globalNorm}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default OptimizerDashboard;
