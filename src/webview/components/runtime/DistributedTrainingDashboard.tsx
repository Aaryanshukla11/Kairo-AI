import React, { useState } from 'react';

export const DistributedTrainingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'topology' | 'workers' | 'synchronization' | 'logs'>('topology');
  const [distState, setDistState] = useState<any>({
    sessionId: 'DIST-SESS-9988',
    mode: 'Multi Node',
    clusterId: 'CLUSTER-Multi-Node-0918',
    nodes: [
      { id: 'node-0', ip: '192.168.1.10', cpu: '55%', ram: '45%', status: 'Online', workersCount: 4 },
      { id: 'node-1', ip: '192.168.1.11', cpu: '51%', ram: '42%', status: 'Online', workersCount: 4 }
    ],
    workers: [
      { id: 'worker-node-0-gpu-0', node: 'node-0', gpu: 0, state: 'Training', gpuUsage: '94%', vram: '15.2 GB', throughput: '4.2K tok/s' },
      { id: 'worker-node-0-gpu-1', node: 'node-0', gpu: 1, state: 'Training', gpuUsage: '92%', vram: '15.1 GB', throughput: '4.1K tok/s' },
      { id: 'worker-node-1-gpu-0', node: 'node-1', gpu: 0, state: 'Training', gpuUsage: '95%', vram: '14.8 GB', throughput: '4.3K tok/s' }
    ],
    sync: {
      syncId: 'SYNC-10820491',
      barrierDuration: '28 ms',
      success: true,
      mismatchCount: 0
    },
    logs: [
      { time: '12:20:00', event: 'Created distributed cluster configuration (CLUSTER-Multi-Node-0918)', type: 'ClusterCreated' },
      { time: '12:20:02', event: 'Registered 8 GPU workers across 2 computing nodes', type: 'WorkersRegistered' },
      { time: '12:20:05', event: 'Assigned global batch slices parameters per worker', type: 'TasksAssigned' },
      { time: '12:20:08', event: 'Executed barrier synchronization barrier (28ms)', type: 'StateSynchronized' },
      { time: '12:20:11', event: 'Synchronized training gradients with PyTorch DDP strategy', type: 'TrainingExecuted' }
    ]
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setDistState((prev: any) => ({
        ...prev,
        sync: {
          ...prev.sync,
          syncId: `SYNC-${Date.now()}`,
          barrierDuration: `${Math.round(20 + Math.random() * 20)} ms`,
          success: true
        },
        logs: [
          { time: new Date().toLocaleTimeString(), event: 'Triggered manual barrier synchronization across workers', type: 'StateSynchronized' },
          ...prev.logs
        ]
      }));
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 48, 20, 0.96) 0%, rgba(12, 32, 12, 0.98) 100%)',
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
              Distributed Training Coordinator Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M07-S01-T002
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Orchestrating GPU workloads cross-node topologies, monitoring synchronization latency, and logs history
          </span>
        </div>

        <div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{
              backgroundColor: isSyncing ? 'rgba(34, 197, 94, 0.5)' : '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isSyncing ? 'Syncing...' : 'Force Sync Barrier'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['topology', 'workers', 'synchronization', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#4ade80' : '#94a3b8',
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
      {activeTab === 'topology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Cluster Nodes Health</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {distState.nodes.map((n: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#4ade80' }}>Node ID: {n.id}</strong>
                  <span style={{ color: '#10b981' }}>{n.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>IP: {n.ip}</div>
                  <div>CPU: {n.cpu}</div>
                  <div>RAM: {n.ram}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'workers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Registered GPU Workers status</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {distState.workers.map((w: any, idx: number) => (
              <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#cbd5e1' }}>{w.id}</strong>
                  <span style={{ marginLeft: '10px', color: '#64748b' }}>({w.state})</span>
                </div>
                <div style={{ display: 'flex', gap: '15px', color: '#cbd5e1' }}>
                  <span>GPU Core: <span style={{ color: '#4ade80' }}>{w.gpuUsage}</span></span>
                  <span>VRAM: <span style={{ color: '#0ea5e9' }}>{w.vram}</span></span>
                  <span>Speed: <span style={{ color: '#eab308' }}>{w.throughput}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'synchronization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Synchronization Progress</span>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
            <div style={{ marginBottom: '6px' }}>Barrier Success: <strong style={{ color: '#10b981' }}>{distState.sync.success ? 'True' : 'False'}</strong></div>
            <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>Sync ID: {distState.sync.syncId}</div>
            <div style={{ color: '#94a3b8' }}>Latency: {distState.sync.barrierDuration} (Mismatches: {distState.sync.mismatchCount})</div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Distributed Event Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {distState.logs.map((l: any, idx: number) => (
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
export default DistributedTrainingDashboard;
