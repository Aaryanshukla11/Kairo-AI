import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const IncrementalEditCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleIncrementalUpdate = (msg: any) => {
      if (msg.type === MessageType.INCREMENTAL_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.INCREMENTAL_UPDATE, handleIncrementalUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.INCREMENTAL_UPDATE, handleIncrementalUpdate);
    };
  }, []);

  const handleRunEditPlanner = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.INCREMENTAL_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_INCREMENTAL_PLAN',
        filePath: 'src/core/baseController.ts',
        fileContent: 'import { Base } from "./base";\nexport class BaseController {\n  public setup() {}\n}\n',
        operations: [
          { type: 'replace', range: { start: 58, end: 74 }, text: 'public setup(id: string) {}' }
        ]
      },
      version: '1.0.0' as any
    });
  };

  const getPreservationPercentage = (ratio: number) => {
    return (ratio * 100).toFixed(1) + '%';
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Incremental Edit Center</h4>
        <button 
          onClick={handleRunEditPlanner}
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
          {loading ? 'Analyzing...' : 'Run Edit Planner'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {artifact ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main indicators dials */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1.2, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ec9b0' }}>
                {getPreservationPercentage(artifact.metrics.preservedRatio)}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Preserved Code</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>
                {artifact.metrics.patchSize} B
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Patch Size</div>
            </div>
          </div>

          {/* Target File details */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Target File</h5>
            <div style={{ fontStyle: 'italic', fontSize: '10px', color: '#ccc' }}>
              📄 {artifact.targetFile}
            </div>
          </div>

          {/* Changed regions list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Changed Regions range offsets</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid rgba(86,156,214,0.3)' }}>
              {artifact.editRegions.map((reg: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#aaa' }}>
                  <strong>Region {idx + 1}:</strong> range offsets [{reg.start}, {reg.end}]
                </div>
              ))}
            </div>
          </div>

          {/* Patch operations text preview */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Patch Operations Details</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '6px', borderRadius: '3px' }}>
              {artifact.patchOperations.map((op: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', borderBottom: idx < artifact.patchOperations.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: '4px', marginBottom: '4px' }}>
                  <div style={{ color: '#569cd6', fontWeight: 'bold' }}>⚡ {op.type.toUpperCase()}</div>
                  <pre style={{ margin: '4px 0 0 0', padding: '4px', backgroundColor: '#000', color: '#fff', fontSize: '9px', overflowX: 'auto', borderRadius: '2px' }}>
                    {op.text}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Level and Warnings checklist */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <span>Estimated Risk: <strong style={{ color: artifact.warnings.length === 0 ? '#4ec9b0' : '#cca700' }}>
              {artifact.warnings.length === 0 ? 'Low' : 'Medium'}
            </strong></span>
            <span style={{ color: artifact.validationSummary.isValid ? '#4ec9b0' : '#f44336' }}>
              ✓ Patch Validated
            </span>
          </div>

          {/* Warnings */}
          {artifact.warnings.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Conflict Warnings</h5>
              {artifact.warnings.map((w: string, idx: number) => (
                <div key={idx} style={{ color: '#f44336', fontSize: '10px' }}>⚠️ {w}</div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No Incremental edit plan generated. Click Run Edit Planner to construct optimized patches.
        </div>
      )}
    </div>
  );
};
