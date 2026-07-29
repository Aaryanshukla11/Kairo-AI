import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const MultiFileGenerationCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleMultiFileUpdate = (msg: any) => {
      if (msg.type === MessageType.MULTIFILE_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.MULTIFILE_UPDATE, handleMultiFileUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.MULTIFILE_UPDATE, handleMultiFileUpdate);
    };
  }, []);

  const handleRunPlanner = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.MULTIFILE_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_MULTIFILE_PLAN',
        plan: {
          operations: [
            { filePath: 'src/core/baseController.ts', operation: 'create', dependencies: [] },
            { filePath: 'src/core/agentController.ts', operation: 'create', dependencies: ['src/core/baseController.ts'] },
            { filePath: 'src/core/viewController.ts', operation: 'modify', dependencies: ['src/core/baseController.ts'] }
          ]
        }
      },
      version: '1.0.0' as any
    });
  };

  const getOperationsSummary = (artifacts: any[]) => {
    const counts = { create: 0, modify: 0, delete: 0, rename: 0, move: 0 };
    for (const art of artifacts) {
      const op = art.operation as keyof typeof counts;
      if (counts[op] !== undefined) {
        counts[op]++;
      }
    }
    return counts;
  };

  const summary = artifact ? getOperationsSummary(artifact.generatedArtifacts) : null;

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Multi-file Generation Center</h4>
        <button 
          onClick={handleRunPlanner}
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
          {loading ? 'Analyzing...' : 'Run MultiPlanner'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Operations dials */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4ec9b0' }}>{summary?.create}</div>
              <div style={{ fontSize: '8px', color: '#888' }}>Created</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#569cd6' }}>{summary?.modify}</div>
              <div style={{ fontSize: '8px', color: '#888' }}>Modified</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f44336' }}>{summary?.delete}</div>
              <div style={{ fontSize: '8px', color: '#888' }}>Deleted</div>
            </div>
          </div>

          {/* Affected files summary list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Affected Files & Connections</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '6px', borderRadius: '3px' }}>
              {artifact.generatedArtifacts.map((art: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', color: '#ccc' }}>
                  <span>📄 {art.path}</span>
                  <span style={{ fontSize: '8px', color: art.operation === 'delete' ? '#f44336' : '#4ec9b0' }}>
                    {art.operation.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dependency Order topological sorting list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Topological Order sequence</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid rgba(86,156,214,0.3)' }}>
              {artifact.creationOrder.map((file: string, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#aaa' }}>
                  <strong>{idx + 1}.</strong> {file}
                </div>
              ))}
            </div>
          </div>

          {/* Duration metrics and Warnings checklist */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <span>⏱️ Duration: <strong>{artifact.metrics.durationMs} ms</strong></span>
            <span style={{ color: artifact.validationSummary.isValid ? '#4ec9b0' : '#f44336' }}>
              ✓ Consistency Validated
            </span>
          </div>

          {/* Warnings */}
          {artifact.warnings.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Warnings</h5>
              {artifact.warnings.map((w: string, idx: number) => (
                <div key={idx} style={{ color: '#f44336', fontSize: '10px' }}>⚠️ {w}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No Multi-file plan generated. Click Run MultiPlanner to determine dependency orders.
        </div>
      )}
    </div>
  );
};
