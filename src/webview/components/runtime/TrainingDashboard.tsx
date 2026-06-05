import React, { useState } from 'react';

export const TrainingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'status' | 'hardware' | 'logs'>('status');
  const [sessState, setSessState] = useState<any>({
    sessionId: 'SESS-TRAIN-0918',
    status: 'Training',
    epoch: 2,
    batch: 450,
    totalSteps: 1000,
    currentStep: 450,
    loss: 1.14,
    valLoss: 1.28,
    lr: '1.24e-4',
    tokensPerSec: '15.4K',
    eta: '01h 12m 04s',
    gpu: 94,
    ram: '12.4 GB',
    vram: '15.2 GB',
    checkpoints: [
      { id: 'CHK-STEP-100', valLoss: 1.62, trainingLoss: 1.54, time: '10 mins ago' },
      { id: 'CHK-STEP-200', valLoss: 1.45, trainingLoss: 1.38, time: '20 mins ago' },
      { id: 'CHK-STEP-300', valLoss: 1.34, trainingLoss: 1.25, time: '30 mins ago' }
    ],
    logs: [
      { time: '11:10:00', event: 'Loaded dataset version ds-1.0.0', type: 'TrainingStateChanged' },
      { time: '11:10:05', event: 'Loaded tokenizer version tok-1.0.0', type: 'TrainingStateChanged' },
      { time: '11:10:09', event: 'Created session SESS-TRAIN-0918', type: 'TrainingStarted' },
      { time: '11:10:12', event: 'Initialized optimizer parameters: AdamW', type: 'TrainingStateChanged' },
      { time: '11:11:00', event: 'Transitioned to state Training', type: 'TrainingStateChanged' }
    ]
  });

  const [isInterrupting, setIsInterrupting] = useState(false);

  const handleInterrupt = () => {
    setIsInterrupting(true);
    setTimeout(() => {
      setSessState((prev: any) => ({
        ...prev,
        status: 'Cancelled',
        logs: [
          { time: new Date().toLocaleTimeString(), event: 'Training run manually cancelled', type: 'TrainingStateChanged' },
          ...prev.logs
        ]
      }));
      setIsInterrupting(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 20, 48, 0.96) 0%, rgba(12, 12, 32, 0.98) 100%)',
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
              Kairo-AI Training Engine Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#0ea5e9',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M07-S01-T001
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Executing framework-agnostic training processes, monitoring loss updates and hardware workload indicators
          </span>
        </div>

        <div>
          <button
            onClick={handleInterrupt}
            disabled={isInterrupting || sessState.status === 'Cancelled'}
            style={{
              backgroundColor: sessState.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.2)' : '#dc2626',
              color: sessState.status === 'Cancelled' ? '#94a3b8' : '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: (isInterrupting || sessState.status === 'Cancelled') ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {sessState.status === 'Cancelled' ? 'Cancelled' : isInterrupting ? 'Stopping...' : 'Interrupt Training'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['status', 'hardware', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#0ea5e9' : '#94a3b8',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Progress row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Current Epoch / Step</div>
              <strong style={{ color: '#0ea5e9', fontSize: '13px' }}>Epoch {sessState.epoch} (Step {sessState.currentStep})</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Training / Val Loss</div>
              <strong style={{ color: '#cbd5e1', fontSize: '13px' }}>{sessState.loss} / {sessState.valLoss}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Learning Rate</div>
              <strong style={{ color: '#eab308', fontSize: '13px' }}>{sessState.lr}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>ETA Remaining</div>
              <strong style={{ color: '#10b981', fontSize: '13px' }}>{sessState.eta}</strong>
            </div>
          </div>

          {/* Checkpoints Saved list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Saved Checkpoints Timeline</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sessState.checkpoints.map((chk: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px', fontSize: '11px' }}>
                  <span style={{ color: '#cbd5e1' }}>{chk.id} (Val Loss: <strong style={{ color: '#ef4444' }}>{chk.valLoss}</strong>, Train Loss: <strong style={{ color: '#64748b' }}>{chk.trainingLoss}</strong>)</span>
                  <span style={{ color: '#64748b' }}>{chk.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hardware' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Hardware Workload Indicators</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>GPU Core Utilization</div>
              <strong style={{ color: '#10b981', fontSize: '13px' }}>{sessState.gpu}%</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>RAM Memory Usage</div>
              <strong style={{ color: '#cbd5e1', fontSize: '13px' }}>{sessState.ram}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>VRAM Memory Usage</div>
              <strong style={{ color: '#0ea5e9', fontSize: '13px' }}>{sessState.vram}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Training Engine event timelines</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {sessState.logs.map((l: any, idx: number) => (
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
export default TrainingDashboard;
