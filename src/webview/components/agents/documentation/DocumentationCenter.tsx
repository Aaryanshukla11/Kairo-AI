import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../../common/protocol';

export const DocumentationCenter: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleDocUpdate = (msg: any) => {
      if (msg.type === MessageType.DOCUMENTATION_UPDATE) {
        const payload = msg.payload || {};
        if (payload.report) {
          setReport(payload.report);
          setLoading(false);
        }
      }
    };

    vscodeBridge.subscribe(MessageType.DOCUMENTATION_UPDATE, handleDocUpdate);
    return () => {
      vscodeBridge.unsubscribe(MessageType.DOCUMENTATION_UPDATE, handleDocUpdate);
    };
  }, []);

  const handleGenerateDocs = () => {
    setLoading(true);
    setErrorMsg('');

    // Mock git changes that trigger docs regeneration planning
    const mockGitChanges = [
      'src/core/agents/testing/testingAgent.ts',
      'src/webview/components/agents/testing/TestingDashboard.tsx',
      'README.md'
    ];

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.DOCUMENTATION_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'GENERATE_DOCS',
        gitChanges: mockGitChanges
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Documentation Center</h4>
        <button 
          onClick={handleGenerateDocs}
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
          {loading ? 'Generating...' : 'Generate Drafts'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ color: '#f44336', fontSize: '11px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Coverage Status */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ec9b0' }}>{report.coverage}%</div>
            <div style={{ fontSize: '9px', color: '#888' }}>Estimated Documentation Coverage</div>
          </div>

          {/* Generated Documents */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Generated / Updated Files</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '80px', overflowY: 'auto' }}>
              {report.generatedDocuments.map((doc: any, idx: number) => (
                <div key={idx} style={{ fontSize: '10px', color: '#ccc' }}>
                  📄 <span style={{ color: '#569cd6' }}>{doc.path}</span> ({doc.type})
                </div>
              ))}
              {report.updatedFiles.map((file: string, idx: number) => (
                <div key={`upd-${idx}`} style={{ fontSize: '10px', color: '#888' }}>
                  ✏️ {file} (Modified)
                </div>
              ))}
            </div>
          </div>

          {/* Pending Documents */}
          <div>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Pending Reviews</h5>
            <div style={{ fontSize: '10px', color: '#ccc' }}>
              • Verify reference links inside newly compiled drafts prior to checkins.
            </div>
          </div>

          {/* Warnings */}
          {report.warnings.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#f44336' }}>Warnings</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {report.warnings.map((w: string, idx: number) => (
                  <div key={idx} style={{ color: '#ccc', fontSize: '10px' }}>⚠️ {w}</div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions.length > 0 && (
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#cca700' }}>Suggestions</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {report.suggestions.map((s: string, idx: number) => (
                  <div key={idx} style={{ color: '#ccc', fontSize: '10px' }}>💡 {s}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#666', textAlign: 'center', padding: '10px 0' }}>
          No documentation generated. Click Generate Drafts to start.
        </div>
      )}
    </div>
  );
};
