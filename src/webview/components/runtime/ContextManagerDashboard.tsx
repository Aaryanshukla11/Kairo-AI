import React, { useState } from 'react';

export const ContextManagerDashboard: React.FC = () => {
  const [report, setReport] = useState<any>({
    contextSize: 2450,
    totalLimit: 8192,
    compressionRatio: 0.72,
    cacheHits: 12,
    sources: [
      { name: 'Workspace Files', tokens: 1200, percent: 49 },
      { name: 'Conversation History', tokens: 650, percent: 27 },
      { name: 'Vector Database', tokens: 400, percent: 16 },
      { name: 'Diagnostics & State', tokens: 200, percent: 8 }
    ],
    priorities: [
      { level: 'Critical', tokens: 850, color: '#ef4444' },
      { level: 'High', tokens: 1100, color: '#f59e0b' },
      { level: 'Medium', tokens: 500, color: '#3b82f6' },
      { level: 'Low', tokens: 0, color: '#10b981' }
    ]
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.9) 0%, rgba(20, 20, 35, 0.95) 100%)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Context Window Controller</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dynamic Context Optimization & Budget Allocation</span>
        </div>
        <span style={{
          fontSize: '10px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          Budget OK
        </span>
      </div>

      {/* Grid Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Context Size</span>
          <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{report.contextSize} / {report.totalLimit}</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Compression Ratio</span>
          <strong style={{ fontSize: '13px', color: '#10b981' }}>{report.compressionRatio * 100}%</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Cache Hits</span>
          <strong style={{ fontSize: '13px', color: '#f59e0b' }}>{report.cacheHits} hits</strong>
        </div>
      </div>

      {/* Progress Budget Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
          <span>Budget Capacity</span>
          <span>{((report.contextSize / report.totalLimit) * 100).toFixed(0)}% Utilized</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${(report.contextSize / report.totalLimit) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)' }}></div>
        </div>
      </div>

      {/* Sources & Priorities Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Token Allocation Sources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Allocation Sources</span>
          {report.sources.map((src: any) => (
            <div key={src.name} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span style={{ color: '#cbd5e1' }}>{src.name}</span>
                <span style={{ color: '#64748b' }}>{src.tokens} tok</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${src.percent}%`, height: '100%', backgroundColor: '#6366f1' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Priorities Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Priority Levels</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {report.priorities.map((pri: any) => (
              <div key={pri.level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pri.color }}></span>
                  <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{pri.level}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>{pri.tokens} tok</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
