import React, { useState } from 'react';

export const ExperimentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'experiments' | 'leaderboard' | 'comparison' | 'logs'>('experiments');
  const [expState, setExpState] = useState<any>({
    experiments: [
      { id: 'EXP-Pretraining-1', version: '1.0.0', type: 'Pretraining', accuracy: '84.0%', loss: 1.25, perplexity: 3.82, tokens: '14.5K/s', time: '19:30', status: 'Completed' },
      { id: 'EXP-Fine-tuning-1', version: '1.0.0', type: 'Fine-tuning', accuracy: '88.5%', loss: 0.98, perplexity: 2.94, tokens: '8.2K/s', time: '19:45', status: 'Completed' }
    ],
    leaderboard: [
      { rank: 1, id: 'EXP-Fine-tuning-1', type: 'Fine-tuning', accuracy: 0.885, loss: 0.98 },
      { rank: 2, id: 'EXP-Pretraining-1', type: 'Pretraining', accuracy: 0.840, loss: 1.25 }
    ],
    comparison: {
      e1: 'EXP-Pretraining-1',
      e2: 'EXP-Fine-tuning-1',
      accuracyDiff: '+4.5%',
      lossDiff: '-0.27',
      perplexityDiff: '-0.88'
    },
    logs: [
      { time: '19:28:00', event: 'Created experiment record (EXP-Pretraining-1)', type: 'ExperimentCreated' },
      { time: '19:28:02', event: 'Registered model weights and configuration artifacts', type: 'ArtifactsRegistered' },
      { time: '19:28:05', event: 'Recorded GPU/VRAM workloads metrics (accuracy 84%)', type: 'MetricsTracked' },
      { time: '19:28:08', event: 'Generated experiment summary reports', type: 'ReportsGenerated' },
      { time: '19:28:11', event: 'Experiment recorded immutably in registry', type: 'HistoryStored' }
    ]
  });

  const [isTracking, setIsTracking] = useState(false);

  const handleCreateExperiment = () => {
    setIsTracking(true);
    setTimeout(() => {
      setExpState((prev: any) => ({
        ...prev,
        experiments: [
          ...prev.experiments,
          { id: 'EXP-Instruction-1', version: '1.1.0', type: 'Instruction Tuning', accuracy: '90.2%', loss: 0.82, perplexity: 2.45, tokens: '12.0K/s', time: new Date().toLocaleTimeString(), status: 'Completed' }
        ],
        leaderboard: [
          { rank: 1, id: 'EXP-Instruction-1', type: 'Instruction Tuning', accuracy: 0.902, loss: 0.82 },
          { rank: 2, id: 'EXP-Fine-tuning-1', type: 'Fine-tuning', accuracy: 0.885, loss: 0.98 },
          { rank: 3, id: 'EXP-Pretraining-1', type: 'Pretraining', accuracy: 0.840, loss: 1.25 }
        ],
        logs: [
          { time: new Date().toLocaleTimeString(), event: 'Registered Instruction Tuning experiment EXP-Instruction-1', type: 'HistoryStored' },
          ...prev.logs
        ]
      }));
      setIsTracking(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(48, 20, 20, 0.96) 0%, rgba(32, 12, 12, 0.98) 100%)',
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
              Experiment Tracker Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T010
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Recording research experiments, monitoring perplexity/accuracy metrics leaderboards, and enabling reproducible replays
          </span>
        </div>

        <div>
          <button
            onClick={handleCreateExperiment}
            disabled={isTracking}
            style={{
              backgroundColor: isTracking ? 'rgba(239, 68, 68, 0.5)' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isTracking ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isTracking ? 'Tracking...' : 'Log Run'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['experiments', 'leaderboard', 'comparison', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#f87171' : '#94a3b8',
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
      {activeTab === 'experiments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Recorded Research Runs</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {expState.experiments.map((e: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#f87171', fontSize: '12px' }}>{e.type} v{e.version}</strong>
                  <span style={{ color: '#64748b' }}>Exp ID: {e.id}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>Loss: <span style={{ color: '#ef4444' }}>{e.loss}</span></div>
                  <div>Perplexity: <span style={{ color: '#ec4899' }}>{e.perplexity}</span></div>
                  <div>Accuracy: <span style={{ color: '#10b981' }}>{e.accuracy}</span></div>
                  <div>Throughput: <span style={{ color: '#0ea5e9' }}>{e.tokens}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#64748b', fontSize: '10px' }}>
                  <span>Created: {e.time}</span>
                  <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '1px 5px', borderRadius: '4px' }}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Experiment accuracy Leaderboard</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {expState.leaderboard.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <strong style={{ color: '#eab308', width: '20px' }}>#{item.rank}</strong>
                  <span style={{ color: '#cbd5e1' }}>{item.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ color: '#64748b' }}>Loss: {item.loss}</span>
                  <strong style={{ color: '#10b981' }}>{(item.accuracy * 100).toFixed(1)}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Parameter comparison View</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div style={{ color: '#cbd5e1', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              Comparing <strong style={{ color: '#f87171' }}>{expState.comparison.e1}</strong> vs <strong style={{ color: '#cbd5e1' }}>{expState.comparison.e2}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '4px' }}>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Accuracy delta</div>
                <strong style={{ color: '#10b981', fontSize: '12px' }}>{expState.comparison.accuracyDiff}</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Loss Delta</div>
                <strong style={{ color: '#10b981', fontSize: '12px' }}>{expState.comparison.lossDiff}</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <div style={{ color: '#64748b', fontSize: '10px' }}>Perplexity Delta</div>
                <strong style={{ color: '#10b981', fontSize: '12px' }}>{expState.comparison.perplexityDiff}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Tracking event timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {expState.logs.map((l: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>[{l.time}]</span>
                <span style={{ color: '#cbd5e1' }}>{l.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
