import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';

interface ModelInfo {
  modelId: string;
  displayName: string;
  provider: string;
  architecture: string;
  format: string;
  version: string;
  parameters: string;
  quantization: string;
  contextLength: number;
  tokenizer: string;
  memoryRequirementGb: number;
  diskSizeGb: number;
  languages: string[];
  capabilities: string[];
  healthStatus: 'Healthy' | 'Degraded' | 'Unhealthy';
  compatible?: boolean;
}

export const ModelRegistryDashboard: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([
    {
      modelId: 'qwen-2.5-7b-coder',
      displayName: 'Qwen 2.5 7B Coder (Mock)',
      provider: 'gguf',
      architecture: 'qwen2',
      format: 'gguf',
      version: '1.0.0',
      parameters: '7B',
      quantization: 'Q4_K_M',
      contextLength: 32768,
      tokenizer: 'qwen',
      memoryRequirementGb: 6,
      diskSizeGb: 4.5,
      languages: ['en', 'zh', 'code'],
      capabilities: ['Chat', 'Code Generation', 'Code Review', 'Code Completion', 'Tool Calling'],
      healthStatus: 'Healthy',
      compatible: true
    },
    {
      modelId: 'llama-3-8b-instruct',
      displayName: 'Llama 3 8B Instruct (Mock)',
      provider: 'gguf',
      architecture: 'llama3',
      format: 'gguf',
      version: '1.0.0',
      parameters: '8B',
      quantization: 'Q4_K_M',
      contextLength: 8192,
      tokenizer: 'llama',
      memoryRequirementGb: 8,
      diskSizeGb: 4.9,
      languages: ['en', 'code'],
      capabilities: ['Chat', 'Code Review', 'Function Calling', 'RAG'],
      healthStatus: 'Healthy',
      compatible: true
    }
  ]);

  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(models[0]);
  const [healthReport, setHealthReport] = useState<any>({
    healthyCount: 2,
    degradedCount: 0,
    unhealthyCount: 0,
    totalModels: 2
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 38, 0.9) 0%, rgba(20, 20, 28, 0.95) 100%)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Model Registry Catalog</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Installed Capabilities & Compatibility Matrix</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', fontSize: '10px' }}>
          <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            Healthy: {healthReport.healthyCount}
          </span>
        </div>
      </div>

      {/* Model Catalog List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Available Local Models</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {models.map((model) => (
            <div
              key={model.modelId}
              onClick={() => setSelectedModel(model)}
              style={{
                backgroundColor: selectedModel?.modelId === model.modelId ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: selectedModel?.modelId === model.modelId ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px', color: '#f1f5f9' }}>{model.displayName}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  Format: {model.format.toUpperCase()} • Parameters: {model.parameters} • Quant: {model.quantization}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '9px',
                  backgroundColor: model.compatible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: model.compatible ? '#10b981' : '#ef4444',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {model.compatible ? 'Compatible' : 'Incompatible'}
                </span>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: model.healthStatus === 'Healthy' ? '#10b981' : '#ef4444'
                }}></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Specifications & Capability Reports */}
      {selectedModel && (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '11px'
        }}>
          <div style={{ fontWeight: 600, fontSize: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', color: '#a5b4fc' }}>
            Model Capabilities & System Integrity
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div><span style={{ color: '#64748b' }}>Architecture:</span> <strong style={{ color: '#cbd5e1' }}>{selectedModel.architecture}</strong></div>
            <div><span style={{ color: '#64748b' }}>Context Length:</span> <strong style={{ color: '#cbd5e1' }}>{selectedModel.contextLength} tokens</strong></div>
            <div><span style={{ color: '#64748b' }}>Memory Required:</span> <strong style={{ color: '#cbd5e1' }}>{selectedModel.memoryRequirementGb} GB RAM</strong></div>
            <div><span style={{ color: '#64748b' }}>Disk Footprint:</span> <strong style={{ color: '#cbd5e1' }}>{selectedModel.diskSizeGb} GB</strong></div>
            <div><span style={{ color: '#64748b' }}>Languages:</span> <strong style={{ color: '#cbd5e1' }}>{selectedModel.languages.join(', ')}</strong></div>
            <div><span style={{ color: '#64748b' }}>Tokenizer Schema:</span> <strong style={{ color: '#cbd5e1' }}>{selectedModel.tokenizer}</strong></div>
          </div>

          <div style={{ marginTop: '4px' }}>
            <span style={{ color: '#64748b', display: 'block', marginBottom: '6px' }}>Supported Model Features:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {selectedModel.capabilities.map((cap) => (
                <span
                  key={cap}
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 500
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
