import React, { useState } from 'react';

export const MixedPrecisionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'history' | 'policy'>('overview');
  
  // Dashboard mock state
  const [precisionState, setPrecisionState] = useState<any>({
    reportId: 'REP-PREC-SESS-8877-step-1240-10938481',
    sessionId: 'SESS-8877',
    currentPrecision: 'bf16',
    requestedPrecision: 'automatic',
    hardwareProfile: {
      deviceType: 'cuda',
      deviceCount: 8,
      precisionSupported: ['fp32', 'fp16', 'bf16'],
      maxBatchSize: 128
    },
    compatibility: {
      isCompatible: true,
      issues: [],
      warnings: ['Running BF16 requires Ampere or newer architecture. Detected A100 GPU.']
    },
    lossScaling: {
      mode: 'automatic',
      currentScale: 1.0,
      consecutiveNormalSteps: 240,
      consecutiveOverflowSteps: 0,
      lastAdjustmentStep: 1000
    },
    overflow: {
      hasOverflow: false,
      overflowCount: 3,
      underflowCount: 1,
      hasUnderflow: false,
      persistentOverflow: false,
      lastOverflowStep: 820,
      layerIssues: []
    },
    recommendations: [
      'BF16 is fully supported and recommended. Exponent range matches FP32, preventing underflows without needing dynamic scaling factors.',
      'Training is stable. Accumulate step count matches baseline expectations.'
    ],
    timeline: [
      { step: 1200, precision: 'bf16', scalingFactor: 1.0, hasOverflow: false },
      { step: 1210, precision: 'bf16', scalingFactor: 1.0, hasOverflow: false },
      { step: 1220, precision: 'bf16', scalingFactor: 1.0, hasOverflow: false },
      { step: 1230, precision: 'bf16', scalingFactor: 1.0, hasOverflow: false },
      { step: 1240, precision: 'bf16', scalingFactor: 1.0, hasOverflow: false }
    ],
    history: [
      { timeStr: '14:22:10', step: 820, action: 'Overflow detected in mlp.gate_proj.weight. Loss scale backed off from 2048.0 to 1024.0.' },
      { timeStr: '14:20:15', step: 750, action: 'Stable convergence window of 500 steps reached. Loss scale multiplied from 1024.0 to 2048.0.' },
      { timeStr: '14:05:32', step: 1, action: 'Mixed Precision Engine initialized with Automatic mode. BF16 selected based on CUDA architecture.' }
    ]
  });

  const [policyMode, setPolicyMode] = useState<string>('automatic');
  const [initialScale, setInitialScale] = useState<number>(1.0);
  const [minScale] = useState<number>(1.0);

  const handleSimulateOverflow = () => {
    setPrecisionState((prev: any) => {
      const nextOverflowCount = prev.overflow.overflowCount + 1;
      const nextScale = prev.lossScaling.mode === 'dynamic' || prev.lossScaling.mode === 'automatic'
        ? Math.max(minScale, prev.lossScaling.currentScale * 0.5)
        : prev.lossScaling.currentScale;
      
      const newHistoryEntry = {
        timeStr: new Date().toTimeString().split(' ')[0],
        step: prev.timeline[prev.timeline.length - 1].step + 10,
        action: `Simulated overflow! Scaling factor reduced to ${nextScale}.`
      };

      const newTimelineEntry = {
        step: prev.timeline[prev.timeline.length - 1].step + 10,
        precision: prev.currentPrecision,
        scalingFactor: nextScale,
        hasOverflow: true
      };

      return {
        ...prev,
        lossScaling: {
          ...prev.lossScaling,
          currentScale: nextScale,
          consecutiveNormalSteps: 0,
          consecutiveOverflowSteps: prev.lossScaling.consecutiveOverflowSteps + 1
        },
        overflow: {
          ...prev.overflow,
          hasOverflow: true,
          overflowCount: nextOverflowCount,
          lastOverflowStep: newTimelineEntry.step
        },
        timeline: [...prev.timeline.slice(1), newTimelineEntry],
        history: [newHistoryEntry, ...prev.history]
      };
    });
  };

  const handleUpdatePolicy = () => {
    setPrecisionState((prev: any) => ({
      ...prev,
      lossScaling: {
        ...prev.lossScaling,
        mode: policyMode,
        currentScale: initialScale
      },
      history: [
        {
          timeStr: new Date().toTimeString().split(' ')[0],
          step: prev.timeline[prev.timeline.length - 1].step,
          action: `Policy updated: Mode set to ${policyMode}, initial scale set to ${initialScale}.`
        },
        ...prev.history
      ]
    }));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 26, 40, 0.95) 0%, rgba(10, 12, 22, 0.98) 100%)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '24px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f8fafc', letterSpacing: '-0.01em' }}>
              Mixed Precision Engine Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              M07-S01-T006
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'inline-block' }}>
            Coordinating precision policies, loss scaling strategies, automatic hardware compatibilities and overflow checks
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSimulateOverflow}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Simulate Overflow
          </button>
        </div>
      </div>

      {/* Main Telemetry Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>Active Precision</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#a78bfa' }}>{precisionState.currentPrecision.toUpperCase()}</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>({precisionState.requestedPrecision})</span>
          </div>
        </div>
        
        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>Scaling Factor</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#60a5fa' }}>
            {precisionState.lossScaling.currentScale}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>Overflow Events</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: precisionState.overflow.overflowCount > 0 ? '#f87171' : '#34d399' }}>
            {precisionState.overflow.overflowCount}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>Hardware Compatibility</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: precisionState.compatibility.isCompatible ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '6px', height: '33px' }}>
            {precisionState.compatibility.isCompatible ? '● Compatible' : '▲ Incompatible'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        {(['overview', 'timeline', 'history', 'policy'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: activeTab === tab ? '#a78bfa' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Hardware & Platform Profile */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Platform Hardware Info</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
              <div>Device Type: <strong style={{ color: '#cbd5e1' }}>{precisionState.hardwareProfile.deviceType.toUpperCase()}</strong></div>
              <div>Device Count: <strong style={{ color: '#cbd5e1' }}>{precisionState.hardwareProfile.deviceCount}</strong></div>
              <div>Supported Precisions: <strong style={{ color: '#cbd5e1' }}>{precisionState.hardwareProfile.precisionSupported.join(', ').toUpperCase()}</strong></div>
            </div>
            {precisionState.compatibility.warnings.map((w: string, idx: number) => (
              <div key={idx} style={{ marginTop: '10px', fontSize: '11px', color: '#fcd34d', backgroundColor: 'rgba(252, 211, 77, 0.05)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(252, 211, 77, 0.15)' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Recommendations Block */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(139, 92, 246, 0.03)', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Runtime Engine Recommendations</span>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {precisionState.recommendations.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Precision & Scaling Factor Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {precisionState.timeline.map((t: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: t.hasOverflow ? 'rgba(239, 68, 68, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                  border: t.hasOverflow ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <span>Step <strong style={{ color: '#f8fafc' }}>{t.step}</strong></span>
                <span>Precision Mode: <span style={{ color: '#a78bfa', fontWeight: 600 }}>{t.precision.toUpperCase()}</span></span>
                <span>Loss Scale: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{t.scalingFactor}</span></span>
                <span style={{
                  color: t.hasOverflow ? '#f87171' : '#34d399',
                  backgroundColor: t.hasOverflow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {t.hasOverflow ? 'Overflow Detected' : 'Healthy'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Precision Engine Event Audit Log</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {precisionState.history.map((h: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <span style={{ color: '#64748b', fontFamily: 'monospace' }}>[{h.timeStr}]</span>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>Step {h.step}</span>
                <span style={{ color: '#cbd5e1' }}>{h.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'policy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Configure active policy options override</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Loss Scaling Strategy:</label>
              <select
                value={policyMode}
                onChange={(e) => setPolicyMode(e.target.value)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '12px'
                }}
              >
                <option value="automatic">Automatic (Policy default)</option>
                <option value="dynamic">Dynamic Scaling</option>
                <option value="static">Static Scaling</option>
                <option value="framework">Framework Native</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Initial Loss Scale factor:</label>
              <input
                type="number"
                value={initialScale}
                onChange={(e) => setInitialScale(parseFloat(e.target.value) || 1.0)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              onClick={handleUpdatePolicy}
              style={{
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Apply Policy Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MixedPrecisionDashboard;
