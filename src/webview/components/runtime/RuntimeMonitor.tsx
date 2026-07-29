import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const RuntimeMonitor: React.FC = () => {
  const [stats, setStats] = useState<any>({
    loadedModel: 'None',
    memoryUsageMb: 0,
    vramUsageMb: 0,
    cpuUsagePct: 0,
    inferenceSpeedTps: 0.0,
    queueLength: 0
  });

  const [modelState, setModelState] = useState<string>('NotLoaded');
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleRuntimeUpdate = (msg: any) => {
      if (msg.type === MessageType.RUNTIME_UPDATE) {
        const { event, stats: newStats, chunk, result } = msg.payload || {};
        if (newStats) setStats(newStats);
        
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
          if (event.type === 'ModelLoaded') setModelState('Ready');
          if (event.type === 'InferenceStarted') setModelState('Busy');
          if (event.type === 'InferenceCompleted') setModelState('Ready');
          if (event.type === 'InferenceCancelled') setModelState('Ready');
        }
      }
    };

    vscodeBridge.subscribe(MessageType.RUNTIME_UPDATE, handleRuntimeUpdate);

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
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.RUNTIME_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'LOAD_MODEL',
        config: {
          modelId: 'qwen-2.5-7b-coder',
          name: 'Qwen 2.5 7B Coder (GGUF Mock)',
          provider: 'MockProvider',
          contextWindow: 32768,
          parametersCount: '7B',
          fileSizeGb: 4.5
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
      backgroundColor: 'var(--vscode-sideBar-background, #252526)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      fontSize: '12px',
      color: '#d4d4d4',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Model Runtime Monitor</h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          {modelState === 'NotLoaded' ? (
            <button 
              onClick={handleLoadModel}
              style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
            >
              Load Model
            </button>
          ) : (
            <button 
              onClick={handleUnloadModel}
              style={{ background: '#f44336', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
            >
              Unload
            </button>
          )}
          <button 
            onClick={handleGenerate}
            disabled={modelState !== 'Ready'}
            style={{
              background: modelState !== 'Ready' ? '#555' : 'var(--vscode-button-secondaryBackground, #3c3c3c)',
              color: '#fff',
              border: 'none',
              padding: '3px 8px',
              borderRadius: '3px',
              cursor: modelState !== 'Ready' ? 'default' : 'pointer',
              fontSize: '11px'
            }}
          >
            Generate
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Resource Monitor</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
            <div>Loaded Model: <strong style={{ color: '#4ec9b0' }}>{stats.loadedModel}</strong></div>
            <div>Model State: <strong style={{ color: modelState === 'Ready' ? '#4ec9b0' : '#f44336' }}>{modelState}</strong></div>
            <div>RAM Usage: <span>{stats.memoryUsageMb} MB</span></div>
            <div>VRAM Usage: <span>{stats.vramUsageMb} MB</span></div>
            <div>CPU Usage: <span>{stats.cpuUsagePct}%</span></div>
            <div>Speed Rate: <span>{stats.inferenceSpeedTps} tokens/sec</span></div>
            <div>Queue Length: <span>{stats.queueLength}</span></div>
          </div>
        </div>

        <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Token Output Stream</h5>
          <div style={{
            maxHeight: '110px',
            overflowY: 'auto',
            padding: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '3px',
            fontFamily: 'monospace',
            fontSize: '10px',
            whiteSpace: 'pre-wrap'
          }}>
            {streamingResponse || <span style={{ fontStyle: 'italic', color: '#666' }}>Waiting for generation...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
