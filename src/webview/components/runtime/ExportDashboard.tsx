import React, { useState } from 'react';

export const ExportDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'compatibility' | 'history'>('queue');

  // Export pipeline interactive state
  const [exportState, setExportState] = useState<any>({
    queue: [
      { id: 'EXP-1', modelId: 'llama-3-ft-sft', format: 'gguf', quantization: 'q4_k_m', status: 'completed', progress: 100, size: '4.2 GB', checksum: 'sha256-abc8877...' },
      { id: 'EXP-2', modelId: 'llama-3-ft-sft', format: 'safetensors', quantization: 'fp16', status: 'completed', progress: 100, size: '15.4 GB', checksum: 'sha256-def8877...' },
      { id: 'EXP-3', modelId: 'llama-3-ft-sft', format: 'onnx', quantization: 'none', status: 'idle', progress: 0, size: '14.8 GB', checksum: 'pending' }
    ],
    history: [
      { id: 'EXP-2', timeStr: '17:15:32', action: 'Safetensors export finished. Size: 15.4 GB. Checksum generated.', status: 'completed' },
      { id: 'EXP-1', timeStr: '17:02:10', action: 'GGUF q4_k_m conversion finished. Size: 4.2 GB. Checksum generated.', status: 'completed' }
    ],
    compatMatrix: {
      gguf: { supported: '✓ Supported', minRamGB: 8, backend: 'llama.cpp', status: 'optimal' },
      safetensors: { supported: '✓ Supported', minRamGB: 16, backend: 'HF transformers', status: 'optimal' },
      onnx: { supported: '✓ Supported', minRamGB: 20, backend: 'ONNX Runtime', status: 'warning' },
      huggingface: { supported: '✓ Supported', minRamGB: 16, backend: 'HF Hub CLI', status: 'optimal' },
      pytorch: { supported: '✓ Supported', minRamGB: 16, backend: 'PyTorch native', status: 'optimal' }
    }
  });

  const [simFormat, setSimFormat] = useState<'gguf' | 'safetensors' | 'onnx' | 'pytorch'>('gguf');
  const [simQuant, setSimQuant] = useState<'none' | 'q4_k_m' | 'q8_0'>('q4_k_m');
  const [exporting, setExporting] = useState<boolean>(false);

  const handleStartExport = () => {
    setExporting(true);
    
    // Simulate pipeline steps
    setTimeout(() => {
      setExportState((prev: any) => {
        const nextId = `EXP-${prev.queue.length + 1}`;
        const newQueueItem = {
          id: nextId,
          modelId: 'llama-3-ft-sft',
          format: simFormat,
          quantization: simQuant,
          status: 'completed',
          progress: 100,
          size: simFormat === 'gguf' && simQuant === 'q4_k_m' ? '4.2 GB' : '15.4 GB',
          checksum: `sha256-sim${Math.floor(Math.random() * 9000000 + 1000000)}...`
        };

        const newHistoryItem = {
          id: nextId,
          timeStr: new Date().toTimeString().split(' ')[0],
          action: `${simFormat.toUpperCase()} export finished for checkpoint models. Checksum registered.`,
          status: 'completed'
        };

        return {
          ...prev,
          queue: [newQueueItem, ...prev.queue],
          history: [newHistoryItem, ...prev.history]
        };
      });
      setExporting(false);
    }, 1500);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(20, 30, 24, 0.95) 0%, rgba(8, 12, 10, 0.98) 100%)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '24px',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
              Model Export Pipeline Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              M07-S01-T010
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'inline-block' }}>
            Packaging trained checkpoints, converting weights files (GGUF, SafeTensors, ONNX), verifying checksum integrity, and registering Unified Model Artifacts
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={simFormat}
            onChange={(e: any) => setSimFormat(e.target.value)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <option value="gguf">GGUF Format</option>
            <option value="safetensors">SafeTensors</option>
            <option value="onnx">ONNX Graph</option>
            <option value="pytorch">PyTorch bin</option>
          </select>

          <select
            value={simQuant}
            onChange={(e: any) => setSimQuant(e.target.value)}
            disabled={simFormat !== 'gguf'}
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: simFormat !== 'gguf' ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="none">No Quantization</option>
            <option value="q4_k_m">q4_k_m (4-bit)</option>
            <option value="q8_0">q8_0 (8-bit)</option>
          </select>

          <button
            onClick={handleStartExport}
            disabled={exporting}
            style={{
              backgroundColor: '#059669',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: exporting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {exporting ? 'Exporting...' : 'Start Export'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        {(['queue', 'compatibility', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: activeTab === tab ? '#34d399' : '#94a3b8',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Active Export Queue & Size Reports</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {exportState.queue.map((item: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.modelId}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '10px' }}>
                    ({item.format.toUpperCase()} | {item.quantization})
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    Checksum: <code style={{ color: '#34d399' }}>{item.checksum}</code>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{item.size}</div>
                  <span style={{
                    fontSize: '10px',
                    color: item.status === 'completed' ? '#34d399' : '#f59e0b',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    marginTop: '4px',
                    display: 'inline-block'
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'compatibility' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Formats Compatibility Matrix</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(exportState.compatMatrix).map(([k, v]: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '12px' }}>
                    Recommended Backend: <strong>{v.backend}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Min Memory: <strong>{v.minRamGB} GB RAM</strong></span>
                  <span style={{
                    color: v.status === 'optimal' ? '#34d399' : '#f59e0b',
                    backgroundColor: v.status === 'optimal' ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {v.supported}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>Export Actions Log History</span>
          {exportState.history.map((h: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ color: '#cbd5e1' }}>
                <span style={{ color: '#94a3b8', marginRight: '10px' }}>[{h.timeStr}]</span>
                {h.action}
              </span>
              <strong style={{ color: '#34d399', fontSize: '10px' }}>SUCCESS</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportDashboard;
