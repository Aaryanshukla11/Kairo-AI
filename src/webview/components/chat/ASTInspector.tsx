import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ASTInspector: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleAstUpdate = (msg: any) => {
      if (msg.type === MessageType.AST_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.AST_UPDATE, handleAstUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.AST_UPDATE, handleAstUpdate);
    };
  }, []);

  const handleInspectAst = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.AST_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_AST',
        language: 'typescript',
        ir: {
          className: 'DecoupledController',
          imports: [
            { symbol: 'BaseController', source: '../base/baseController' }
          ],
          methods: [
            { name: 'setupRegistry' }
          ]
        }
      },
      version: '1.0.0' as any
    });
  };

  const renderTreeNode = (node: any, depth = 0): React.ReactNode => {
    if (!node) return null;
    return (
      <div key={node.type + (node.name || '') + depth} style={{ marginLeft: `${depth * 10}px`, fontSize: '10px', color: '#ccc', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '4px' }}>
        🔑 Type: <strong style={{ color: '#569cd6' }}>{node.type}</strong> 
        {node.name && <span> Name: <span style={{ color: '#4ec9b0' }}>{node.name}</span></span>}
        {node.value && <span> Value: <span style={{ color: '#cca700' }}>{node.value}</span></span>}
        {node.start !== undefined && <span style={{ color: '#666', fontSize: '8px' }}> ({node.start}:{node.end})</span>}
        {node.children && node.children.map((c: any) => renderTreeNode(c, depth + 1))}
      </div>
    );
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>AST Inspector</h4>
        <button 
          onClick={handleInspectAst}
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
          {loading ? 'Analyzing...' : 'Inspect AST'}
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
                {artifact.language.toUpperCase()}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Language</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#569cd6' }}>
                {artifact.metadata.nodesCount}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Total Nodes</div>
            </div>
          </div>

          {/* Optimization summaries */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>🌲 Max Depth: <strong>{artifact.metadata.depth}</strong></div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '3px' }}>
              <div style={{ fontSize: '11px', color: '#ccc' }}>⚙️ Optimized: <strong>{artifact.metadata.optimized ? 'Yes' : 'No'}</strong></div>
            </div>
          </div>

          {/* Symbols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Imports</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
                {artifact.imports.length === 0 ? 'None' : artifact.imports.map((imp: string, idx: number) => (
                  <span key={idx}>📥 {imp}</span>
                ))}
              </div>
            </div>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Exports</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px' }}>
                {artifact.exports.length === 0 ? 'None' : artifact.exports.map((exp: string, idx: number) => (
                  <span key={idx}>📤 {exp}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tree structure */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>AST Tree Structures</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '8px', borderRadius: '3px' }}>
              {renderTreeNode(artifact.rootNode)}
            </div>
          </div>

          {/* Diagnostics warning logs */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Diagnostics</h5>
            {artifact.diagnostics.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#666', fontSize: '10px' }}>No compiler diagnostics alerts.</div>
            ) : (
              artifact.diagnostics.map((d: string, idx: number) => (
                <div key={idx} style={{ color: '#f44336', fontSize: '10px' }}>⚠️ {d}</div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No AST generated. Click Inspect AST to verify language syntax trees.
        </div>
      )}
    </div>
  );
};
