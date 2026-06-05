import React, { useState } from 'react';

export const RuntimeOptimizerDashboard: React.FC = () => {
  const [optimizer, setOptimizer] = useState<any>({
    cpu: 32,
    gpu: 58,
    ram: 6.2,
    vram: 3.8,
    tokensPerSec: 34.5,
    latencyMs: 820,
    status: 'Optimized',
    activeStrategy: 'Balanced Optimization',
    timeline: [
      { time: '10:00', text: 'Collected baseline metrics' },
      { time: '10:02', text: 'Compacted Context window to 4096' },
      { time: '10:05', text: 'Allocated CPU threads (4)' },
      { time: '10:10', text: 'GC triggered successfully' }
    ]
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 55, 0.9) 0%, rgba(20, 20, 45, 0.95) 100%)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Runtime Performance Optimizer</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dynamic Threading & Memory Garbage Collector</span>
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
          {optimizer.status}
        </span>
      </div>

      {/* Strategy Selector */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#64748b' }}>Active Strategy: </span>
          <strong style={{ color: '#38bdf8' }}>{optimizer.activeStrategy}</strong>
        </div>
      </div>

      {/* Grid Specs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '8px', color: '#64748b' }}>CPU Usage</span>
          <strong style={{ fontSize: '12px', color: '#cbd5e1' }}>{optimizer.cpu}%</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '8px', color: '#64748b' }}>GPU Usage</span>
          <strong style={{ fontSize: '12px', color: '#cbd5e1' }}>{optimizer.gpu}%</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '8px', color: '#64748b' }}>Host RAM</span>
          <strong style={{ fontSize: '12px', color: '#cbd5e1' }}>{optimizer.ram} GB</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '8px', color: '#64748b' }}>GPU VRAM</span>
          <strong style={{ fontSize: '12px', color: '#cbd5e1' }}>{optimizer.vram} GB</strong>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Speed Rate</span>
          <strong style={{ fontSize: '13px', color: '#10b981' }}>{optimizer.tokensPerSec} TPS</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Inference Latency</span>
          <strong style={{ fontSize: '13px', color: '#f59e0b' }}>{optimizer.latencyMs} ms</strong>
        </div>
      </div>

      {/* Timeline logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Optimization Decisions Timeline</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {optimizer.timeline.map((item: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>[{item.time}]</span>
              <span style={{ color: '#cbd5e1' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
