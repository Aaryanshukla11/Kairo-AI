import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const RuntimeMonitor: React.FC = () => {
  const [stats, setStats] = useState<any>({
    loadedModel: 'None',
    memoryUsageMb: 0,
    vramUsageMb: 0,
    cpuUsagePct: 0,
    gpuUsagePct: 0,
    inferenceSpeedTps: 0.0,
    queueLength: 0,
    contextLength: 0,
    healthStatus: 'Healthy'
  });

  const [modelState, setModelState] = useState<string>('NotLoaded');
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('qwen-2.5-7b-coder');

  useEffect(() => {
    const handleRuntimeUpdate = (msg: any) => {
      if (msg.type === MessageType.RUNTIME_UPDATE) {
        const { event, stats: newStats, chunk, result } = msg.payload || {};
        if (newStats) {
          setStats({
            loadedModel: newStats.loadedModel || 'None',
            memoryUsageMb: newStats.memoryUsageMb || 0,
            vramUsageMb: newStats.vramUsageMb || 0,
            cpuUsagePct: newStats.cpuUsagePct || 0,
            gpuUsagePct: newStats.gpuUsagePct || 0,
            inferenceSpeedTps: newStats.inferenceSpeedTps || 0.0,
            queueLength: newStats.queueLength || 0,
            contextLength: newStats.contextLength || 32768,
            healthStatus: newStats.healthStatus || 'Healthy'
          });
        }
        
        if (chunk) {
          setStreamingResponse((prev) => prev + chunk);
        }
        if (result) {
          setStreamingResponse(result.response);
          setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Completed: ${result.tokensGenerated} tokens generated`, ...prev]);
        }

        if (event) {
          setLogs((prev) => [`[${new Date(event.timestamp).toLocaleTimeString()}] ${event.type}`, ...prev.slice(0, 10)]);
          if (event.type === 'ModelLoading') setModelState('Loading');
          if (event.type === 'ModelLoaded' || event.type === 'ModelReady') setModelState('Ready');
          if (event.type === 'InferenceStarted') setModelState('Busy');
          if (event.type === 'InferenceCompleted') setModelState('Ready');
          if (event.type === 'InferenceCancelled') setModelState('Ready');
        }
      }
    };

    vscodeBridge.subscribe(MessageType.RUNTIME_UPDATE, handleRuntimeUpdate);

    // Initial stats fetch
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RUNTIME_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_STATS' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.RUNTIME_UPDATE, handleRuntimeUpdate);
    };
  }, []);

  const handleLoadModel = () => {
    const isQwen = selectedModel === 'qwen-2.5-7b-coder';
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RUNTIME_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'LOAD_MODEL',
        config: isQwen ? {
          modelId: 'qwen-2.5-7b-coder',
          name: 'Qwen 2.5 7B Coder (GGUF Mock)',
          provider: 'MockProvider',
          contextWindow: 32768,
          parametersCount: '7B',
          fileSizeGb: 4.5
        } : {
          modelId: 'llama-3-8b-instruct',
          name: 'Llama 3 8B Instruct (GGUF Mock)',
          provider: 'MockProvider',
          contextWindow: 8192,
          parametersCount: '8B',
          fileSizeGb: 4.9
        }
      },
      version: '1.0.0' as any
    });
  };

  const handleUnloadModel = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RUNTIME_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'UNLOAD_MODEL' },
      version: '1.0.0' as any
    });
    setModelState('NotLoaded');
    setStreamingResponse('');
  };

  const handleGenerate = () => {
    setStreamingResponse('');
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RUNTIME_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE',
        promptPkg: {
          userPrompt: 'Write a typescript function to binary search an array'
        },
        genConfig: {
          temperature: 0.7,
          maxTokens: 500
        }
      },
      version: '1.0.0' as any
    });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.9) 0%, rgba(20, 20, 25, 0.95) 100%)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Model Runtime Dashboard</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Local AI Execution Engine</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '4px 8px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: stats.healthStatus === 'Healthy' ? '#10b981' : stats.healthStatus === 'Degraded' ? '#f59e0b' : '#ef4444',
            display: 'inline-block'
          }}></span>
          <span style={{ fontSize: '11px', fontWeight: 500, color: '#f1f5f9' }}>{stats.healthStatus}</span>
        </div>
      </div>

      {/* Model Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={modelState !== 'NotLoaded'}
          style={{
            flex: 1,
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '6px 10px',
            color: '#f8fafc',
            fontSize: '12px',
            outline: 'none'
          }}
        >
          <option value="qwen-2.5-7b-coder">Qwen 2.5 7B Coder (Mock)</option>
          <option value="llama-3-8b-instruct">Llama 3 8B Instruct (Mock)</option>
        </select>

        {modelState === 'NotLoaded' ? (
          <button 
            onClick={handleLoadModel}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            Load
          </button>
        ) : (
          <button 
            onClick={handleUnloadModel}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}
          >
            Unload
          </button>
        )}
      </div>

      {/* Grid Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {/* Memory Usage */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '10px'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>RAM / VRAM</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{stats.memoryUsageMb} MB / {stats.vramUsageMb} MB</span>
        </div>

        {/* Inference Speed */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '10px'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Throughput</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{stats.inferenceSpeedTps} tok/sec</span>
        </div>

        {/* CPU & GPU Usage */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '10px'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CPU / GPU</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{stats.cpuUsagePct}% / {stats.gpuUsagePct}%</span>
        </div>

        {/* Context Window */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '10px'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Context Window</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{stats.contextLength || 32768} tokens</span>
        </div>
      </div>

      {/* Model State & Queue */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '11px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Loaded Model:</span>
          <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{stats.loadedModel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Lifecycle State:</span>
          <span style={{
            fontWeight: 600,
            color: modelState === 'Ready' ? '#10b981' : modelState === 'Loading' ? '#f59e0b' : modelState === 'Busy' ? '#6366f1' : '#94a3b8'
          }}>{modelState}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#94a3b8' }}>Inference Queue:</span>
          <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{stats.queueLength} tasks</span>
        </div>
      </div>

      {/* Run Generation Test */}
      <button 
        onClick={handleGenerate}
        disabled={modelState !== 'Ready'}
        style={{
          background: modelState !== 'Ready' ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: modelState !== 'Ready' ? '#64748b' : '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: modelState !== 'Ready' ? 'default' : 'pointer',
          fontWeight: 600,
          fontSize: '12px',
          transition: 'all 0.2s',
          boxShadow: modelState === 'Ready' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none'
        }}
      >
        Run Test Generation
      </button>

      {/* Output Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Response Stream</span>
        <div style={{
          maxHeight: '130px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          fontFamily: 'Fira Code, Consolas, Monaco, monospace',
          fontSize: '11px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          color: '#38bdf8'
        }}>
          {streamingResponse || <span style={{ fontStyle: 'italic', color: '#475569' }}>Waiting for prompt trigger...</span>}
        </div>
      </div>
    </div>
  );
};
