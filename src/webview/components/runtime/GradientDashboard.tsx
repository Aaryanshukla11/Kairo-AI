import React, { useState } from 'react';

export const GradientDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'norms' | 'clipping' | 'anomalies' | 'timeline'>('norms');
  const [gradState, setGradState] = useState<any>({
    reportId: 'GRAD-REP-SESS-9988-10920491',
    sessionId: 'SESS-9988',
    globalNorm: 0.354,
    globalMean: 0.002,
    globalVariance: 0.0007,
    validationStatus: 'Valid',
    layers: [
      { layerName: 'attn.q_proj.weight', gradNorm: 0.154, gradMean: 0.002, gradVariance: 0.0004, gradDensity: 0.98, hasAnomaly: false },
      { layerName: 'attn.k_proj.weight', gradNorm: 0.128, gradMean: -0.001, gradVariance: 0.0003, gradDensity: 0.99, hasAnomaly: false },
      { layerName: 'mlp.gate_proj.weight', gradNorm: 0.285, gradMean: 0.005, gradVariance: 0.0015, gradDensity: 0.95, hasAnomaly: false }
    ],
    anomalies: {
      hasAnomaly: false,
      nanDetected: false,
      infDetected: false,
      explodingGradients: false,
      vanishingGradients: false,
      sparseGradients: false,
      issues: []
    },
    clippingEvents: [
      { step: 120, type: 'Norm Clipping', threshold: 1.0, valueBefore: 1.45, valueAfter: 1.0 },
      { step: 180, type: 'Value Clipping', threshold: 0.05, valueBefore: 0.09, valueAfter: 0.05 }
    ],
    timeline: [
      { step: 100, globalNorm: 0.38, status: 'Normal' },
      { step: 110, globalNorm: 0.36, status: 'Normal' },
      { step: 120, globalNorm: 1.0, status: 'Clipped' },
      { step: 130, globalNorm: 0.35, status: 'Normal' }
    ]
  });

  const [clippingPolicy, setClippingPolicy] = useState<string>('Norm');
  const [threshold, setThreshold] = useState<number>(1.0);

  const handleUpdatePolicy = () => {
    setGradState((prev: any) => ({
      ...prev,
      clippingEvents: [
        { step: prev.clippingEvents.length + 1, type: `${clippingPolicy} Clipping`, threshold: threshold, valueBefore: 1.15, valueAfter: threshold },
        ...prev.clippingEvents
      ]
    }));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(24, 24, 38, 0.96) 0%, rgba(12, 12, 20, 0.98) 100%)',
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
              Gradient Engine Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M07-S01-T003
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Monitoring gradient norms, variance calculations, anomalies detection, and parameter clipping adjustments
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11px' }}>
          <span>Policy:</span>
          <select
            value={clippingPolicy}
            onChange={(e) => setClippingPolicy(e.target.value)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '11px'
            }}
          >
            <option value="Norm">Norm</option>
            <option value="Value">Value</option>
            <option value="Adaptive">Adaptive</option>
            <option value="None">None</option>
          </select>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value) || 1.0)}
            style={{
              width: '50px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              borderRadius: '4px',
              padding: '2px 4px',
              fontSize: '11px'
            }}
          />
          <button
            onClick={handleUpdatePolicy}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Apply Policy
          </button>
        </div>
      </div>

      {/* Main Aggregates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Global Gradient Norm</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>{gradState.globalNorm}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Average Mean</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>{gradState.globalMean}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Average Variance</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#a78bfa' }}>{gradState.globalVariance}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Validation Status</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399' }}>{gradState.validationStatus}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['norms', 'clipping', 'anomalies', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#60a5fa' : '#94a3b8',
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
      {activeTab === 'norms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Parameter Layers Gradients</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {gradState.layers.map((l: any, idx: number) => (
              <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#cbd5e1' }}>{l.layerName}</strong>
                <div style={{ display: 'flex', gap: '15px', color: '#cbd5e1' }}>
                  <span>Norm: <span style={{ color: '#60a5fa' }}>{l.gradNorm}</span></span>
                  <span>Mean: <span style={{ color: '#38bdf8' }}>{l.gradMean}</span></span>
                  <span>Variance: <span style={{ color: '#a78bfa' }}>{l.gradVariance}</span></span>
                  <span>Density: <span style={{ color: '#34d399' }}>{(l.gradDensity * 100).toFixed(0)}%</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'clipping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Clipped Events logs</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {gradState.clippingEvents.map((e: any, idx: number) => (
              <div key={idx} style={{ padding: '6px 12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Step {e.step}: <strong style={{ color: '#fca5a5' }}>{e.type}</strong> (Threshold={e.threshold})</span>
                <span style={{ color: '#fca5a5' }}>Norm scaled from {e.valueBefore} to {e.valueAfter}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'anomalies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Anomaly Report Summary</span>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '11px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#cbd5e1' }}>
              <div>NaN Detected: <strong style={{ color: gradState.anomalies.nanDetected ? '#fca5a5' : '#34d399' }}>{gradState.anomalies.nanDetected ? 'True' : 'False'}</strong></div>
              <div>Infinity Detected: <strong style={{ color: gradState.anomalies.infDetected ? '#fca5a5' : '#34d399' }}>{gradState.anomalies.infDetected ? 'True' : 'False'}</strong></div>
              <div>Exploding Gradients: <strong style={{ color: gradState.anomalies.explodingGradients ? '#fca5a5' : '#34d399' }}>{gradState.anomalies.explodingGradients ? 'True' : 'False'}</strong></div>
              <div>Vanishing Gradients: <strong style={{ color: gradState.anomalies.vanishingGradients ? '#fcd34d' : '#34d399' }}>{gradState.anomalies.vanishingGradients ? 'True' : 'False'}</strong></div>
            </div>
            {gradState.anomalies.issues.length > 0 && (
              <div style={{ marginTop: '10px', padding: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', color: '#fca5a5' }}>
                {gradState.anomalies.issues.map((i: string, idx: number) => <div key={idx}>{i}</div>)}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Gradient Norm Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {gradState.timeline.map((t: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>Step {t.step}</span>
                <span style={{ color: '#60a5fa' }}>Norm: {t.globalNorm}</span>
                <span style={{ color: t.status === 'Clipped' ? '#fca5a5' : '#34d399' }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default GradientDashboard;
