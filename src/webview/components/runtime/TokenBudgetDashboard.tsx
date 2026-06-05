import React, { useState } from 'react';

export const TokenBudgetDashboard: React.FC = () => {
  const [budget, setBudget] = useState<any>({
    totalBudget: 8192,
    allocated: 4800,
    remaining: 3392,
    completionPrediction: 1500,
    warnings: [
      'Workspace Context allocation is near 80% usage threshold.'
    ],
    allocations: [
      { name: 'System Prompts', size: 500, color: '#6366f1' },
      { name: 'Workspace Snippets', size: 2200, color: '#38bdf8' },
      { name: 'Conversation Log', size: 600, color: '#10b981' },
      { name: 'Diagnostics', size: 100, color: '#ef4444' },
      { name: 'Predicted Completion', size: 1400, color: '#f59e0b' }
    ]
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.9) 0%, rgba(20, 20, 40, 0.95) 100%)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Token Budget Dashboard</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Dynamic Token Allocation & Estimation Engine</span>
        </div>
        <span style={{
          fontSize: '10px',
          backgroundColor: budget.warnings.length > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          color: budget.warnings.length > 0 ? '#f59e0b' : '#10b981',
          border: budget.warnings.length > 0 ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          {budget.warnings.length > 0 ? 'Budget Warnings' : 'Optimal'}
        </span>
      </div>

      {/* Grid Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Total Budget</span>
          <strong style={{ fontSize: '13px', color: '#cbd5e1' }}>{budget.totalBudget} tok</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Allocated</span>
          <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{budget.allocated} tok</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Remaining</span>
          <strong style={{ fontSize: '13px', color: '#10b981' }}>{budget.remaining} tok</strong>
        </div>
      </div>

      {/* Progress Allocation Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Allocation Breakdown</span>
        <div style={{ display: 'flex', gap: '4px', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          {budget.allocations.map((alloc: any) => (
            <div
              key={alloc.name}
              style={{
                width: `${(alloc.size / budget.totalBudget) * 100}%`,
                height: '100%',
                backgroundColor: alloc.color
              }}
              title={`${alloc.name}: ${alloc.size} tokens`}
            ></div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {budget.allocations.map((alloc: any) => (
            <div key={alloc.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: alloc.color }}></span>
              <span style={{ color: '#cbd5e1' }}>{alloc.name} ({alloc.size} tok)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions Spec */}
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
          <span style={{ color: '#64748b' }}>Completion Prediction: </span>
          <strong style={{ color: '#f59e0b' }}>~{budget.completionPrediction} tokens</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Safety Margin: </span>
          <strong style={{ color: '#10b981' }}>500 tokens</strong>
        </div>
      </div>

      {/* Warnings Console */}
      {budget.warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Active Warnings</span>
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#fca5a5'
          }}>
            {budget.warnings.map((w: string, idx: number) => (
              <div key={idx}>• {w}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
