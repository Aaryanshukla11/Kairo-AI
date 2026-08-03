import React, { useState } from 'react';

export const TrainingConfigurationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'configs' | 'templates' | 'hardware' | 'logs'>('configs');
  const [configState, setConfigState] = useState<any>({
    configs: [
      { id: 'CFG-Pretraining-1', version: '1.0.0', type: 'Pretraining', dataset: '1.2.0', tokenizer: '1.1.0', model: 'Decoder-Only GPT-like', optimizer: 'AdamW', lr: '6e-4', epochs: 5, status: 'Valid' },
      { id: 'CFG-Fine-tuning-1', version: '1.0.0', type: 'Fine-tuning', dataset: '1.2.0', tokenizer: '1.1.0', model: 'LoRA Adapter', optimizer: 'AdamW', lr: '2e-5', epochs: 3, status: 'Valid' }
    ],
    templates: [
      { name: 'Pretraining Default', optimizer: 'AdamW', scheduler: 'cosine', precision: 'bf16', lr: '6e-4', batchSize: 32 },
      { name: 'Fine-tuning Default', optimizer: 'AdamW', scheduler: 'linear', precision: 'fp16', lr: '2e-5', batchSize: 8 },
      { name: 'Instruction Tuning Default', optimizer: 'AdamW', scheduler: 'cosine', precision: 'bf16', lr: '5e-5', batchSize: 16 }
    ],
    hardware: {
      device: 'CUDA / NVIDIA A100 GPU',
      count: 4,
      supportedPrecision: 'fp32, fp16, bf16',
      maxBatch: 128
    },
    logs: [
      { time: '17:40:00', event: 'Received configuration build request', type: 'RequestReceived' },
      { time: '17:40:01', event: 'Applied Pretraining templates hyperparameters with overrides', type: 'ConfigurationBuilt' },
      { time: '17:40:03', event: 'Validated parameters checks (precision bf16, optimizer AdamW, scheduler cosine)', type: 'ParametersValidated' },
      { time: '17:40:05', event: 'Generated training configuration manifest', type: 'ManifestGenerated' },
      { time: '17:40:08', event: 'Training configuration registered immutably in registry', type: 'ConfigurationRegistered' }
    ]
  });

  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuildConfig = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setConfigState((prev: any) => ({
        ...prev,
        configs: [
          ...prev.configs,
          { id: 'CFG-Instruction-1', version: '1.1.0', type: 'Instruction Tuning', dataset: '1.2.0', tokenizer: '1.1.0', model: 'Instruct LLaMA', optimizer: 'AdamW', lr: '5e-5', epochs: 3, status: 'Valid' }
        ],
        logs: [
          { time: new Date().toLocaleTimeString(), event: 'Registered Instruction Tuning configuration v1.1.0', type: 'ConfigurationRegistered' },
          ...prev.logs
        ]
      }));
      setIsBuilding(false);
    }, 800);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(36, 48, 20, 0.96) 0%, rgba(22, 32, 12, 0.98) 100%)',
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
              Training Configuration Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(132, 204, 22, 0.15)',
              color: '#84cc16',
              border: '1px solid rgba(132, 204, 22, 0.3)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 600
            }}>
              M06-S01-T008
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Building training parameters configurations, validating scheduler constraints, and registering reproducible manifests
          </span>
        </div>

        <div>
          <button
            onClick={handleBuildConfig}
            disabled={isBuilding}
            style={{
              backgroundColor: isBuilding ? 'rgba(132, 204, 22, 0.5)' : '#84cc16',
              color: '#000000',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isBuilding ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isBuilding ? 'Building...' : 'Build Configuration'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
        {(['configs', 'templates', 'hardware', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === tab ? '#84cc16' : '#94a3b8',
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
      {activeTab === 'configs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Active Training Configurations</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {configState.configs.map((c: any, idx: number) => (
              <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#84cc16', fontSize: '12px' }}>{c.type} v{c.version}</strong>
                  <span style={{ color: '#64748b' }}>Config ID: {c.id}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', color: '#cbd5e1' }}>
                  <div>Dataset: <span style={{ color: '#0ea5e9' }}>{c.dataset}</span></div>
                  <div>Tokenizer: <span style={{ color: '#ec4899' }}>{c.tokenizer}</span></div>
                  <div>Learning Rate: <span style={{ color: '#eab308' }}>{c.lr}</span></div>
                  <div>Epochs: <span style={{ color: '#a78bfa' }}>{c.epochs}</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#64748b', fontSize: '10px' }}>
                  <span>Architecture: {c.model}</span>
                  <span style={{ backgroundColor: 'rgba(132, 204, 22, 0.15)', color: '#84cc16', padding: '1px 5px', borderRadius: '4px' }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Reusable Hyperparameters Templates</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {configState.templates.map((t: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
                <strong style={{ color: '#cbd5e1' }}>{t.name}</strong>
                <div style={{ display: 'flex', gap: '12px', color: '#64748b' }}>
                  <span>LR: <strong style={{ color: '#eab308' }}>{t.lr}</strong></span>
                  <span>Batch: <strong style={{ color: '#a78bfa' }}>{t.batchSize}</strong></span>
                  <span>Precision: <strong style={{ color: '#84cc16' }}>{t.precision}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hardware' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Hardware Compatibility Profile</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Device Info</div>
              <strong style={{ color: '#cbd5e1', fontSize: '12px' }}>{configState.hardware.device} ({configState.hardware.count}x)</strong>
            </div>
            <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '11px' }}>
              <div style={{ color: '#64748b' }}>Precision Formats</div>
              <strong style={{ color: '#84cc16', fontSize: '12px' }}>{configState.hardware.supportedPrecision}</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Configuration Logs timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '180px', overflowY: 'auto' }}>
            {configState.logs.map((l: any, idx: number) => (
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
