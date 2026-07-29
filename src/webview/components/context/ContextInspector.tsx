import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const ContextInspector: React.FC = () => {
  const [context, setContext] = useState<any | null>(null);

  useEffect(() => {
    const handleContextUpdate = (msg: any) => {
      if (msg.type === MessageType.CONTEXT_UPDATE) {
        setContext(msg.payload?.context || null);
      }
    };

    vscodeBridge.subscribe(MessageType.CONTEXT_UPDATE, handleContextUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CONTEXT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_ACTIVE' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.CONTEXT_UPDATE, handleContextUpdate);
    };
  }, []);

  const handleBuildMockContext = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CONTEXT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: {
        action: 'BUILD',
        filePaths: ['package.json', 'src/extension/index.ts'],
        selection: {
          filePath: 'src/extension/index.ts',
          selectedText: 'console.log("Welcome Sasta Antigravity Context Inspector");',
          startLine: 10,
          endLine: 12
        },
        planner: {
          activePlanId: 'mock-plan-111',
          planStepsCount: 4,
          planStatus: 'PendingApproval'
        },
        execution: {
          graphId: 'mock-graph-222',
          nodesExecuted: 2,
          totalNodes: 6,
          status: 'Running'
        },
        git: {
          branch: 'main',
          statusSummary: '2 files modified, 0 staged',
          modifiedFilesCount: 2
        },
        diagnostics: [],
        limitBytes: 100 * 1024
      },
      version: '1.0.0' as any
    });
  };

  const handleExpire = () => {
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.CONTEXT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'EXPIRE' },
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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>AI Context Inspector</h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={handleBuildMockContext}
            style={{ background: 'var(--vscode-button-background)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
          >
            Rebuild
          </button>
          {context && (
            <button 
              onClick={handleExpire}
              style={{ background: 'var(--vscode-button-secondaryBackground, #3c3c3c)', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {context ? (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Metadata Metrics</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Project: <strong>{context.workspace.projectName}</strong></div>
              <div>Estimated Tokens: <strong style={{ color: '#4ec9b0' }}>{context.metadata.tokenEstimateTotal}</strong></div>
              <div>Size: <strong style={{ color: '#d7ba7d' }}>{(context.metadata.sizeBytesTotal / 1024).toFixed(2)} KB</strong></div>
              <div>Limit: <span>{(context.metadata.limitBytes / 1024).toFixed(2)} KB</span></div>
              <div>Git Branch: <span style={{ fontFamily: 'monospace' }}>{context.git?.branch || 'None'}</span></div>
            </div>

            <div style={{ marginTop: '6px' }}>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>State Summaries</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                <div>Planner: <span style={{ opacity: 0.8 }}>{context.planner?.planStatus || 'Idle'}</span></div>
                <div>Execution: <span style={{ opacity: 0.8 }}>{context.execution?.status || 'Idle'} ({context.execution?.nodesExecuted || 0}/{context.execution?.totalNodes || 0} nodes)</span></div>
                <div>Diagnostics: <span style={{ opacity: 0.8 }}>{context.diagnostics?.length || 0} items</span></div>
              </div>
            </div>
          </div>

          <div style={{ flex: 2, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Included Files ({context.files.length})</h5>
              <div style={{
                maxHeight: '60px',
                overflowY: 'auto',
                padding: '4px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '3px',
                fontSize: '10px',
                fontFamily: 'monospace'
              }}>
                {context.files.map((f: any) => (
                  <div key={f.filePath} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{f.filePath}</span>
                    <span style={{ opacity: 0.6 }}>{f.tokenEstimate} tokens</span>
                  </div>
                ))}
              </div>
            </div>

            {context.selection?.selectedText && (
              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#888' }}>Active Selection ({context.selection.filePath})</h5>
                <pre style={{
                  backgroundColor: '#1e1e1e',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  padding: '6px',
                  maxHeight: '50px',
                  overflowY: 'auto',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: '#d4d4d4',
                  margin: 0
                }}>
                  {context.selection.selectedText}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '8px', opacity: 0.6, fontStyle: 'italic' }}>
          <span>No context package built yet</span>
          <span style={{ fontSize: '11px' }}>Click "Rebuild" to generate a mock unified context package for review</span>
        </div>
      )}
    </div>
  );
};
