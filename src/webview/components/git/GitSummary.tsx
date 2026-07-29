import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType, MessageSource, MessageTarget } from '../../../common/protocol';

export const GitSummary: React.FC = () => {
  const [repository, setRepository] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [diff, setDiff] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [commitMsg, setCommitMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const handleGitUpdate = (msg: any) => {
      if (msg.type === MessageType.GIT_UPDATE) {
        const { repository: repo, status: stat, history: hist, diff: d } = msg.payload || {};
        if (repo) setRepository(repo);
        if (stat) setStatus(stat);
        if (hist) setHistory(hist);
        if (d !== undefined) setDiff(d);
      }
    };

    vscodeBridge.subscribe(MessageType.GIT_UPDATE, handleGitUpdate);

    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.GIT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_STATUS' },
      version: '1.0.0' as any
    });

    return () => {
      vscodeBridge.unsubscribe(MessageType.GIT_UPDATE, handleGitUpdate);
    };
  }, []);

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.GIT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'GET_DIFF', filePath: path },
      version: '1.0.0' as any
    });
  };

  const handleCommitSubmit = () => {
    if (!commitMsg.trim()) return;
    vscodeBridge.postMessage({
      id: Date.now().toString(),
      type: MessageType.GIT_REQUEST,
      timestamp: Date.now(),
      source: MessageSource.WEBVIEW,
      target: MessageTarget.EXTENSION,
      payload: { action: 'COMMIT', message: commitMsg },
      version: '1.0.0' as any
    });
    setCommitMsg('');
    setShowConfirm(false);
    setSelectedFile(null);
    setDiff('');
  };

  const changedFiles = status?.changedFiles || [];
  const latestCommit = history[0];

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
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Git Repository Summary</span>
          {repository?.isDirty && (
            <span style={{ fontSize: '9px', backgroundColor: 'var(--vscode-charts-orange, #d7ba7d)', color: '#000', padding: '1px 5px', borderRadius: '2px' }}>DIRTY</span>
          )}
        </h4>
        <span style={{ opacity: 0.6, fontSize: '11px' }}>Branch: <strong>{repository?.branch || 'N/A'}</strong></span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Changes ({changedFiles.length})</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
            {changedFiles.map((file: any) => (
              <div 
                key={file.path} 
                onClick={() => handleFileClick(file.path)}
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  backgroundColor: selectedFile === file.path ? 'var(--vscode-list-activeSelectionBackground, #37373d)' : 'transparent'
                }}
              >
                <span>{file.path}</span>
                <strong style={{
                  color: file.status === 'Added' ? '#4ec9b0' : 
                         file.status === 'Modified' ? '#569cd6' : 
                         file.status === 'Deleted' ? '#f85149' : '#d7ba7d'
                }}>{file.status}</strong>
              </div>
            ))}
            {changedFiles.length === 0 && (
              <span style={{ fontStyle: 'italic', color: '#666', padding: '4px 0' }}>No local changes</span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Latest Commit</h5>
          {latestCommit ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div>Message: <strong>{latestCommit.message}</strong></div>
              <div>Author: <span style={{ opacity: 0.8 }}>{latestCommit.author}</span></div>
              <div>Hash: <span style={{ opacity: 0.8, fontFamily: 'monospace' }}>{latestCommit.hash.substring(0, 7)}</span></div>
              <div style={{ opacity: 0.6 }}>{latestCommit.date}</div>
            </div>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#666' }}>No commit history found</span>
          )}
        </div>
      </div>

      {selectedFile && (
        <div style={{ marginTop: '8px' }}>
          <h5 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#888' }}>Diff Preview: {selectedFile}</h5>
          <pre style={{
            margin: 0,
            padding: '8px',
            backgroundColor: '#1e1e1e',
            borderRadius: '4px',
            overflowX: 'auto',
            maxHeight: '120px',
            fontSize: '10px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            color: '#d4d4d4'
          }}>
            {diff || 'No diff content'}
          </pre>
        </div>
      )}

      {repository?.isDirty && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Enter commit message..."
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'var(--vscode-input-background, #3c3c3c)',
                color: '#fff',
                border: '1px solid var(--border)',
                padding: '4px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                outline: 'none'
              }}
            />
            <button 
              onClick={() => setShowConfirm(true)}
              disabled={!commitMsg.trim()}
              style={{
                background: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              Commit Changes
            </button>
          </div>

          {showConfirm && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(215, 186, 125, 0.1)',
              border: '1px solid #d7ba7d',
              borderRadius: '4px',
              padding: '8px',
              marginTop: '4px'
            }}>
              <span style={{ color: '#d7ba7d', fontSize: '11px' }}>Every commit requires explicit approval. Commit staged changes?</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={handleCommitSubmit}
                  style={{
                    backgroundColor: '#4ec9b0',
                    color: '#000',
                    border: 'none',
                    padding: '2px 8px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  Approve
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: '1px solid #666',
                    padding: '2px 8px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
