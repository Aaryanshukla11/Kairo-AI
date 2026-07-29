import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ConventionCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleConventionUpdate = (msg: any) => {
      if (msg.type === MessageType.CONVENTION_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.CONVENTION_UPDATE, handleConventionUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.CONVENTION_UPDATE, handleConventionUpdate);
    };
  }, []);

  const handleScanConventions = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CONVENTION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'ANALYZE_CONVENTIONS',
        files: [
          { path: 'src/core/baseController.ts', content: 'export class BaseController {}' },
          { path: 'src/core/agentController.ts', content: 'export class AgentController {}' },
          { path: 'src/core/viewController.ts', content: 'export class ViewController {}' }
        ]
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Convention Center</h4>
        <button 
          onClick={handleScanConventions}
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
          {loading ? 'Scanning...' : 'Scan Conventions'}
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
                {(artifact.confidence * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Confidence score</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#569cd6', marginTop: '2px' }}>
                {artifact.namingRules.casing}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Casing Rule</div>
            </div>
          </div>

          {/* Naming rules details */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Import & Code Style Rules</h5>
            <div style={{ fontSize: '10px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span>🔌 Import Style: <strong>{artifact.importRules.style}</strong></span>
              <span>🔒 Strict Nulls: <strong>{artifact.codeStyleRules.strictNulls ? 'Yes' : 'No'}</strong></span>
              <span>🎨 Tab Size: <strong>{artifact.formattingRules.tabSize} spaces</strong></span>
            </div>
          </div>

          {/* Folder structure rules list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Folder structure rules</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid rgba(86,156,214,0.3)' }}>
              {artifact.folderRules.map((rule: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#aaa' }}>
                  📁 {rule.path} ➔ {rule.convention}
                </div>
              ))}
            </div>
          </div>

          {/* Architecture boundaries checklist */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Architecture rules</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
              {artifact.architectureRules.map((rule: any, idx: number) => (
                <span key={idx} style={{ color: '#cca700' }}>✓ {rule.constraintRule}</span>
              ))}
            </div>
          </div>

          {/* Representative Example */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Representative Examples Casing</h5>
            <pre style={{ margin: '4px 0 0 0', padding: '4px', backgroundColor: '#000', color: '#fff', fontSize: '9px', overflowX: 'auto', borderRadius: '2px' }}>
              {`export class BaseController {\n  // camelCase is enforced\n  public registerAgent() {}\n}`}
            </pre>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No project conventions profile loaded. Trigger repository scan to infer styles.
        </div>
      )}
    </div>
  );
};
