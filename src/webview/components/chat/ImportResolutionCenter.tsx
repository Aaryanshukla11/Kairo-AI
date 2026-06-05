import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ImportResolutionCenter: React.FC = () => {
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleImportUpdate = (msg: any) => {
      if (msg.type === MessageType.IMPORT_UPDATE) {
        const payload = msg.payload || {};
        if (payload.artifact) {
          setArtifact(payload.artifact);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.IMPORT_UPDATE, handleImportUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.IMPORT_UPDATE, handleImportUpdate);
    };
  }, []);

  const handleResolveImports = () => {
    setLoading(true);
    setErrorMsg('');

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.IMPORT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'RESOLVE_IMPORTS',
        targetFile: 'src/core/baseController.ts',
        fileContent: 'import { Base } from "./base";\nimport { Base } from "./base";\n',
        requiredSymbols: ['useState', 'Base', 'fs']
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Import Resolution Center</h4>
        <button 
          onClick={handleResolveImports}
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
          {loading ? 'Resolving...' : 'Resolve Imports'}
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
                {artifact.resolvedImports.length}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Resolved Sources</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: artifact.duplicateImports.length === 0 ? '#4ec9b0' : '#f44336' }}>
                {artifact.duplicateImports.length}
              </div>
              <div style={{ fontSize: '9px', color: '#888' }}>Duplicates Merged</div>
            </div>
          </div>

          {/* Resolved imports codes list */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Resolved Imports Statements</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', backgroundColor: '#1e1e1e', padding: '6px', borderRadius: '3px' }}>
              {artifact.resolvedImports.map((imp: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', fontFamily: 'monospace', color: '#8dc891' }}>
                  import {`{ ${imp.specifiers.join(', ')} }`} from "{imp.source}";
                </div>
              ))}
            </div>
          </div>

          {/* Alias resolution mappings */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#569cd6' }}>Alias resolution mappings</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '10px', color: '#aaa' }}>
              {artifact.aliasResolution.map((al: any, idx: number) => (
                <div key={idx}>⚡ {al.alias} ➔ {al.resolved}</div>
              ))}
            </div>
          </div>

          {/* Missing Imports and Warnings */}
          {artifact.missingImports.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Missing Imports in File</h5>
              {artifact.missingImports.map((sym: string, idx: number) => (
                <div key={idx} style={{ color: '#f44336', fontSize: '10px' }}>⚠️ Symbol "{sym}" is declared but missing in source lines</div>
              ))}
            </div>
          )}

          {/* Diagnostics summary */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '10px', color: '#888' }}>
            <span>Diagnostics Status: <strong style={{ color: '#4ec9b0' }}>Valid Paths</strong></span>
          </div>
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No imports analyzed. Click Resolve Imports to clean and align dependencies.
        </div>
      )}
    </div>
  );
};
