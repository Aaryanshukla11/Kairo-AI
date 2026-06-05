import React, { useState } from 'react';

export const ModelRouterDashboard: React.FC = () => {
  const [decision, setDecision] = useState<any>({
    selectedModel: 'Qwen 2.5 7B Coder (GGUF)',
    routingScore: 0.94,
    alternatives: [
      { name: 'DeepSeek Reasoning 8B', score: 0.81 },
      { name: 'Llama 3 8B Instruct', score: 0.76 }
    ],
    decisionFactors: {
      capabilityMatch: 1.0,
      resourceAvailability: 0.95,
      performanceEstimate: 0.88
    },
    fallbackChain: [
      'qwen-2.5-7b-coder',
      'deepseek-reasoning-8b',
      'llama-3-8b-instruct',
      'CPU Mock Fallback'
    ]
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 52, 0.9) 0%, rgba(20, 20, 42, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '20px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Multi-Model Router</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Optimal Model Selector Engine</span>
        </div>
        <span style={{
          fontSize: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          Decision Score: {decision.routingScore * 100}%
        </span>
      </div>

      {/* Selected Model Spec */}
      <div style={{
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ display: 'block', fontSize: '9px', color: '#818cf8', textTransform: 'uppercase', fontWeight: 600 }}>Selected Optimal Model</span>
          <strong style={{ fontSize: '14px', color: '#f8fafc' }}>{decision.selectedModel}</strong>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>Confidence: High</span>
      </div>

      {/* Decision Factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Routing Metrics & Scores</span>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px'
        }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Capabilities Match</span>
            <strong style={{ fontSize: '12px', color: '#38bdf8' }}>{decision.decisionFactors.capabilityMatch * 100}%</strong>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Resource Safety</span>
            <strong style={{ fontSize: '12px', color: '#10b981' }}>{decision.decisionFactors.resourceAvailability * 100}%</strong>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Speed/TPS score</span>
            <strong style={{ fontSize: '12px', color: '#f59e0b' }}>{decision.decisionFactors.performanceEstimate * 100}%</strong>
          </div>
        </div>
      </div>

      {/* Alternative Models & Fallbacks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Candidates List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Candidate Alternatives</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {decision.alternatives.map((alt: any) => (
              <div key={alt.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{alt.name}</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{(alt.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fallback Chain */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Fallback Chain</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {decision.fallbackChain.map((model: string, idx: number) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
                <span style={{ color: '#64748b' }}>{idx + 1}.</span>
                <span style={{ color: idx === 0 ? '#10b981' : '#cbd5e1' }}>{model}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
