import React, { useState } from 'react';

export const FineTuningDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters' | 'metrics' | 'timeline'>('overview');

  // Fine-tuning interactive mock state
  const [ftState, setFtState] = useState<any>({
    sessionId: 'FT-SESS-8800',
    baseModelId: 'llama-3-8b-instruct',
    method: 'lora',
    status: 'active',
    currentEpoch: 2,
    currentStep: 240,
    totalEpochs: 5,
    totalSteps: 500,
    trainableParams: {
      totalParameters: 8030000000,
      trainableParameters: 16700000,
      percentageTrainable: 0.208,
      frozenParameters: 8013300000,
      adapterParameters: 16700000
    },
    loraConfig: {
      r: 8,
      alpha: 16,
      dropout: 0.05,
      targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj'],
      bias: 'none'
    },
    metrics: {
      trainingLoss: 0.842,
      validationLoss: 0.895,
      learningRate: 1e-4,
      gpuUsagePercent: 88,
      vramUsageMB: 6154,
      elapsedSec: 120
    },
    timeline: [
      { step: 50, trainLoss: 1.450, valLoss: 1.480, gpu: 88, vram: 6154 },
      { step: 100, trainLoss: 1.250, valLoss: 1.290, gpu: 88, vram: 6154 },
      { step: 150, trainLoss: 1.050, valLoss: 1.100, gpu: 88, vram: 6154 },
      { step: 200, trainLoss: 0.942, valLoss: 0.985, gpu: 88, vram: 6154 },
      { step: 240, trainLoss: 0.842, valLoss: 0.895, gpu: 88, vram: 6154 }
    ],
    history: [
      { timeStr: '16:42:01', action: 'Fine-tuning step 240 executed. Loss: 0.842.' },
      { timeStr: '16:30:15', action: 'Validation check run at step 200. Loss: 0.985.' },
      { timeStr: '16:15:30', action: 'Checkpoint saved at step 100. CHK-FT-FT-SESS-8800-100.' }
    ]
  });

  const [simMethod, setSimMethod] = useState<'lora' | 'qlora' | 'full'>('lora');

  const handleSimulateStep = () => {
    setFtState((prev: any) => {
      const nextStep = prev.currentStep + 20;
      if (nextStep > prev.totalSteps) {
        return {
          ...prev,
          status: 'completed',
          currentStep: prev.totalSteps,
          currentEpoch: prev.totalEpochs
        };
      }
      
      const nextEpoch = Math.ceil(nextStep / 100);
      const nextTrainLoss = parseFloat((prev.metrics.trainingLoss - 0.045 + Math.random() * 0.01).toFixed(4));
      const nextValLoss = parseFloat((nextTrainLoss + 0.05 + Math.random() * 0.01).toFixed(4));

      const newMetrics = {
        ...prev.metrics,
        trainingLoss: nextTrainLoss,
        validationLoss: nextValLoss,
        elapsedSec: prev.metrics.elapsedSec + 10
      };

      const newTimelineEntry = {
        step: nextStep,
        trainLoss: nextTrainLoss,
        valLoss: nextValLoss,
        gpu: prev.metrics.gpuUsagePercent,
        vram: prev.metrics.vramUsageMB
      };

      const newHistoryEntry = {
        timeStr: new Date().toTimeString().split(' ')[0],
        action: `Step ${nextStep}: Training loss decayed to ${nextTrainLoss}. Validation loss: ${nextValLoss}.`
      };

      return {
        ...prev,
        currentStep: nextStep,
        currentEpoch: nextEpoch,
        metrics: newMetrics,
        timeline: [...prev.timeline.slice(1), newTimelineEntry],
        history: [newHistoryEntry, ...prev.history]
      };
    });
  };

  const handleConfigChange = (method: 'lora' | 'qlora' | 'full') => {
    setSimMethod(method);
    setFtState((prev: any) => {
      let trainable = 16700000;
      let percent = 0.208;
      let vram = 6154;

      if (method === 'qlora') {
        trainable = 16700000;
        percent = 0.208;
        vram = 4154; // lower VRAM for 4-bit
      } else if (method === 'full') {
        trainable = 8030000000;
        percent = 100;
        vram = 16154;
      }

      return {
        ...prev,
        method,
        trainableParams: {
          ...prev.trainableParams,
          trainableParameters: trainable,
          percentageTrainable: percent,
          frozenParameters: prev.trainableParams.totalParameters - trainable
        },
        metrics: {
          ...prev.metrics,
          vramUsageMB: vram
        }
      };
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(22, 28, 45, 0.95) 0%, rgba(11, 15, 24, 0.98) 100%)',
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
              Fine-Tuning Engine Dashboard
            </h4>
            <span style={{
              fontSize: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: '#a855f7',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              M07-S01-T009
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'inline-block' }}>
            Orchestrating post-pretraining adaptation configurations, parameter-efficient weight adapters, trainable weights splits, and telemetry status
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={simMethod}
            onChange={(e: any) => handleConfigChange(e.target.value)}
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
            <option value="lora">LoRA Mode</option>
            <option value="qlora">QLoRA Mode</option>
            <option value="full">Full Fine-Tuning</option>
          </select>
          <button
            onClick={handleSimulateStep}
            disabled={ftState.status === 'completed'}
            style={{
              backgroundColor: ftState.status === 'completed' ? '#4b5563' : '#7c3aed',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: ftState.status === 'completed' ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {ftState.status === 'completed' ? 'Completed' : 'Simulate Steps'}
          </button>
        </div>
      </div>

      {/* Main Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Base Model ID</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ftState.baseModelId}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Trainable parameters</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>
            {(ftState.trainableParams.trainableParameters / 1000000).toFixed(1)}M ({ftState.trainableParams.percentageTrainable}%)
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Loss (Train / Val)</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#34d399' }}>
            {ftState.metrics.trainingLoss} / {ftState.metrics.validationLoss}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Progress</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#a78bfa' }}>
            Epoch {ftState.currentEpoch} ({((ftState.currentStep / ftState.totalSteps) * 100).toFixed(0)}%)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        {(['overview', 'parameters', 'metrics', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
              color: activeTab === tab ? '#a855f7' : '#94a3b8',
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
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '10px' }}>Fine-Tuning Active Method Settings</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
              <div>Method type: <strong style={{ color: '#cbd5e1', textTransform: 'uppercase' }}>{ftState.method}</strong></div>
              {ftState.method !== 'full' && (
                <>
                  <div>LoRA Rank: <strong style={{ color: '#cbd5e1' }}>{ftState.loraConfig.r}</strong></div>
                  <div>LoRA Alpha: <strong style={{ color: '#cbd5e1' }}>{ftState.loraConfig.alpha}</strong></div>
                </>
              )}
            </div>
            {ftState.method !== 'full' && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                Target Modules: <code style={{ color: '#a78bfa' }}>{ftState.loraConfig.targetModules.join(', ')}</code>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'parameters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Parameters Breakdown</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Total Parameters:</span>
                <strong>{ftState.trainableParams.totalParameters.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Trainable Parameters:</span>
                <strong style={{ color: '#38bdf8' }}>{ftState.trainableParams.trainableParameters.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Frozen Parameters:</span>
                <strong style={{ color: '#94a3b8' }}>{ftState.trainableParams.frozenParameters.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <span>Adapter parameters:</span>
                <strong style={{ color: '#a78bfa' }}>{ftState.trainableParams.adapterParameters.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '12px' }}>Execution Telemetry</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '13px' }}>
              <div>GPU Usage: <strong style={{ color: '#cbd5e1' }}>{ftState.metrics.gpuUsagePercent}%</strong></div>
              <div>VRAM Usage: <strong style={{ color: '#cbd5e1' }}>{ftState.metrics.vramUsageMB} MB</strong></div>
              <div>Learning Rate: <strong style={{ color: '#cbd5e1' }}>{ftState.metrics.learningRate}</strong></div>
              <div>Elapsed Time: <strong style={{ color: '#cbd5e1' }}>{ftState.metrics.elapsedSec}s</strong></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Training Step Timeline</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ftState.timeline.map((t: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <span>Step <strong style={{ color: '#f8fafc' }}>{t.step}</strong></span>
                <span>Train Loss: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{t.trainLoss}</span></span>
                <span>Val Loss: <span style={{ color: '#34d399', fontWeight: 600 }}>{t.valLoss}</span></span>
                <span>VRAM Peak: <span style={{ color: '#cbd5e1' }}>{t.vram} MB</span></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FineTuningDashboard;
