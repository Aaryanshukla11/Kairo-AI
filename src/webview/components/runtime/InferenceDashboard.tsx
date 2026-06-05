import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';

export const InferenceDashboard: React.FC = () => {
  const [session, setSession] = useState<any>({
    currentModel: 'Qwen 2.5 7B Coder (GGUF)',
    state: 'Ready',
    streamingOutput: '',
    tokensPerSec: 28.4,
    latencyMs: 1200,
    promptTokens: 42,
    completionTokens: 114,
    memoryUsageMb: 850,
    queueLength: 0
  });

  const [prompt, setPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleRunInference = () => {
    if (!prompt.trim()) return;
    setIsStreaming(true);
    setSession((prev: any) => ({
      ...prev,
      state: 'Running',
      streamingOutput: ''
    }));

    // Simulating token streaming locally for the dashboard demo
    const mockTokens = `[Inference stream for: "${prompt}"]\n\nHere is a simple TypeScript binary search implementation:\n\n\`\`\`typescript\nfunction binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\`\`\``;

    const words = mockTokens.split(' ');
    let output = '';
    let i = 0;

    const interval = setInterval(() => {
      if (i >= words.length) {
        clearInterval(interval);
        setIsStreaming(false);
        setSession((prev: any) => ({
          ...prev,
          state: 'Completed',
          streamingOutput: output,
          latencyMs: 980,
          tokensPerSec: 32.5,
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: Math.ceil(output.length / 4)
        }));
      } else {
        output += words[i] + ' ';
        setSession((prev: any) => ({
          ...prev,
          state: 'Streaming',
          streamingOutput: output
        }));
        i++;
      }
    }, 15);
  };

  const handleCancel = () => {
    setIsStreaming(false);
    setSession((prev: any) => ({
      ...prev,
      state: 'Cancelled'
    }));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 30, 42, 0.9) 0%, rgba(20, 20, 32, 0.95) 100%)',
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
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>Inference Pipeline Controller</h4>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Realtime Local AI Inference Pipeline</span>
        </div>
        <span style={{
          fontSize: '10px',
          backgroundColor: isStreaming ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.1)',
          color: isStreaming ? '#818cf8' : '#10b981',
          border: isStreaming ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          {session.state}
        </span>
      </div>

      {/* Model Spec Summary */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '10px 12px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#64748b' }}>Active Model: </span>
          <strong style={{ color: '#cbd5e1' }}>{session.currentModel}</strong>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>Queue Length: </span>
          <strong style={{ color: '#cbd5e1' }}>{session.queueLength}</strong>
        </div>
      </div>

      {/* Grid Telemetry */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>TPS Rate</span>
          <strong style={{ fontSize: '13px', color: '#10b981' }}>{session.tokensPerSec}</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Latency</span>
          <strong style={{ fontSize: '13px', color: '#f59e0b' }}>{session.latencyMs} ms</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Memory</span>
          <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{session.memoryUsageMb} MB</strong>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Prompt Tokens</span>
          <strong style={{ fontSize: '12px', color: '#cbd5e1' }}>{session.promptTokens}</strong>
        </div>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>Completion Tokens</span>
          <strong style={{ fontSize: '12px', color: '#cbd5e1' }}>{session.completionTokens}</strong>
        </div>
      </div>

      {/* Input Prompt */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Test pipeline prompt..."
          style={{
            flex: 1,
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#f8fafc',
            fontSize: '12px',
            outline: 'none'
          }}
        />
        {isStreaming ? (
          <button
            onClick={handleCancel}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={handleRunInference}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            Execute
          </button>
        )}
      </div>

      {/* Output Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Response stream</span>
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          fontFamily: 'Fira Code, Consolas, Monaco, monospace',
          fontSize: '11px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          color: '#38bdf8'
        }}>
          {session.streamingOutput || <span style={{ fontStyle: 'italic', color: '#475569' }}>Waiting for execution run...</span>}
        </div>
      </div>
    </div>
  );
};
