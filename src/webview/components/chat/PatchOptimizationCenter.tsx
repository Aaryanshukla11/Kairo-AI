import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const PatchOptimizationCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOptimizationUpdate = (msg: any) => {
      if (msg.type === MessageType.OPTIMIZATION_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.OPTIMIZATION_UPDATE, handleOptimizationUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.OPTIMIZATION_UPDATE, handleOptimizationUpdate);
    };
  }, []);

  const handleOptimizePatch = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.OPTIMIZATION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'OPTIMIZE_PATCH',
        targetFile: 'src/core/baseController.ts',
        patchContent: '--- a/baseController.ts\n+++ b/baseController.ts\n+const x = 1;\n+const x = 1;\n-const y = 2;\n'
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Patch Optimization Center</h4>
        <button 
          onClick={handleOptimizePatch}
          disabled={loading}
          style={{
            background: 'var(--vscode-button-background)',
            color: '#fff',
            border: 'none',
            padding: '3px 8px',
            borderRadius: '3px',
            cursor: loading ? 'default' : 'pointer',
            fontSize: '11px'
          }}
        >
          {loading ? 'Optimizing...' : 'Optimize Patch'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>
                {(artifact.optimizationRatio * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Size Reduced</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: artifact.predictedMergeRisk === 'low' ? '#4ec9b0' : '#cca700' }}>
                {artifact.predictedMergeRisk.toUpperCase()}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Merge Risk</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span>Original Patch Size: <strong>{artifact.originalPatchSize} bytes</strong></span>
            <span>Optimized Patch Size: <strong>{artifact.optimizedPatchSize} bytes</strong></span>
          </div>

          {artifact.mergedOperations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Merged Operations</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9px', color: '#aaa' }}>
                {artifact.mergedOperations.map((op: string, idx: number) => (
                  <div key={idx}>🔗 {op}</div>
                ))}
              </div>
            </div>
          )}

          {artifact.removedOperations.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Removed Operations</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '9px', color: '#aaa' }}>
                {artifact.removedOperations.map((op: string, idx: number) => (
                  <div key={idx}>❌ {op}</div>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '10px', color: '#888' }}>
            <span>Diagnostics Status: <strong style={{ color: '#4ec9b0' }}>Safe Optimizations Only</strong></span>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No patch optimized. Click Optimize Patch to begin structural analysis.
        </div>
      )}
    </div>
  );
};
