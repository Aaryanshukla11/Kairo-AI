import React, { useState } from 'react';

export const CheckpointDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkpoints' | 'retention' | 'storage' | 'logs'>('checkpoints');
  const [checkpointState, setCheckpointState] = useState<any>({
    checkpoints: [
      { id: 'CHK-STEP-1000', step: 1000, epoch: 1, loss: 1.84, valLoss: 1.95, accuracy: '78.5%', time: '18:10', status: 'Stable' },
      { id: 'CHK-STEP-2000', step: 2000, epoch: 2, loss: 1.42, valLoss: 1.58, accuracy: '82.0%', time: '18:25', status: 'Best' }
    ],
    retention: {
      policy: 'Latest N',
      limit: 5,
      activeRules: 'Prune everything except the last 5 checkpoints and the 3 best validation loss checkpoints'
    },
    storage: {
      totalBytes: '135 MB',
      avgSize: '45 MB',
      filesCount: 6,
      freeDisk: '240 GB'
    },
    logs: [
      { time: '18:24:00', event: 'Initiated training state snapshot pipeline', type: 'TrainingStateReceived' },
      { time: '18:24:02', event: 'Validated parameters states (optimizer type AdamW matches target configuration)', type: 'StateValidated' },
      { time: '18:24:05', event: 'Generated training step 2000 checkpoint manifest', type: 'ManifestGenerated' },
      { time: '18:24:08', event: 'Compressed checkpoint artifact binary models (45MB -> 15MB)', type: 'ArtifactCompressed' },
      { time: '18:24:11', event: 'Registered step 2000 model checkpoint in immutable registry', type: 'ArtifactRegistered' }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleCreateCheckpoint = () => {
    setIsSaving(true);
    setTimeout(() => {
      setCheckpointState((prev: any) => ({
        ...prev,
        checkpoints: [
          ...prev.checkpoints,
          { id: 'CHK-STEP-3000', step: 3000, epoch: 3, loss: 1.15, valLoss: 1.34, accuracy: '85.2%', time: new Date().toLocaleTimeString(), status: 'Active' }
        ],
        logs: [
          { time: new Date().toLocaleTimeString(), event: 'Registered step 3000 model checkpoint', type: 'ArtifactRegistered' },
          ...prev.logs
        ]
      }));
      setIsSaving(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 36, 48, 0.96) 0%, rgba(12, 22, 32, 0.98) 100%)',
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
              Model Checkpoint Dashboard
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
              M06-S01-T009
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Storing resumable model configurations, executing pruning retention policies, and monitoring storage space metrics
          </span>
        </div>

        <div>
          <button
            onClick={handleCreateCheckpoint}
            disabled={isSaving}
            style={{
              backgroundColor: isSaving ? 'rgba(14, 165, 233, 0.5)' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Checkpoint'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['checkpoints', 'retention', 'storage', 'logs'] as const).map(tab => (
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
      {activeTab === 'checkpoints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Checkpoint Timeline & Validation Status</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {checkpointState.checkpoints.map((c: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#0ea5e9', fontSize: '12px' }}>{c.id}</strong>
                  <span style={{ color: '#64748b' }}>Step: {c.step}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>Epoch: <span style={{ color: '#0ea5e9' }}>{c.epoch}</span></div>
                  <div>Loss: <span style={{ color: '#ef4444' }}>{c.loss}</span></div>
                  <div>Val Loss: <span style={{ color: '#ef4444' }}>{c.valLoss}</span></div>
                  <div>Accuracy: <span style={{ color: '#10b981' }}>{c.accuracy}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#64748b', fontSize: '10px' }}>
                  <span>Created: {c.time}</span>
                  <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#0ea5e9', padding: '1px 5px', borderRadius: '4px' }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'retention' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Retention Policy</span>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
            <div style={{ marginBottom: '6px' }}>Policy Type: <strong style={{ color: '#eab308' }}>{checkpointState.retention.policy}</strong> (Limit: {checkpointState.retention.limit})</div>
            <div style={{ color: '#64748b', lineHeight: 1.4 }}>{checkpointState.retention.activeRules}</div>
          </div>
        </div>
      )}

      {activeTab === 'storage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Storage Usage stats</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Total Space Used</div>
              <strong style={{ color: '#cbd5e1', fontSize: '13px' }}>{checkpointState.storage.totalBytes}</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Available Disk</div>
              <strong style={{ color: '#10b981', fontSize: '13px' }}>{checkpointState.storage.freeDisk}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Checkpoint Logs timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {checkpointState.logs.map((l: any, idx: number) => (
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
