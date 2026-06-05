import React, { useState, useEffect } from 'react';
import { vscodeBridge } from '../../services/vscodeBridge';
import { MessageType } from '../../../common/protocol';
import { logKairoStage } from '../../../common/kairoLogger';

export function ReviewChangesBar(): React.JSX.Element {
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    const handleReviewUpdate = (msg: any) => {
      const executionId = msg.payload?.executionId || `rev-${Date.now()}`;
      const startTime = Date.now();
      logKairoStage('ReviewChanges', 'ENTER', executionId, { filesCount: msg.payload?.changedFiles?.length || 0 });

      try {
        if (msg.payload && Array.isArray(msg.payload.changedFiles)) {
          setChangedFiles(msg.payload.changedFiles);
        }
        if (msg.payload && msg.payload.fileContents) {
          setFileContents(msg.payload.fileContents);
        }
        const duration = Date.now() - startTime;
        logKairoStage('ReviewChanges', 'EXIT', executionId, { filesCount: msg.payload?.changedFiles?.length || 0 }, { renderSuccess: true }, duration);
      } catch (error: any) {
        const duration = Date.now() - startTime;
        logKairoStage('ReviewChanges', 'ERROR', executionId, { filesCount: msg.payload?.changedFiles?.length || 0 }, null, duration, error);
      }
    };
    const handleExecutionStatus = (msg: any) => {
      if (msg.payload?.status === 'running' || msg.payload?.action === 'clear_stale') {
        setChangedFiles([]);
        setFileContents({});
      }
    };
    vscodeBridge.subscribe(MessageType.REVIEW_UPDATE, handleReviewUpdate);
    vscodeBridge.subscribe(MessageType.EXECUTION_STATUS, handleExecutionStatus);
    return () => {
      vscodeBridge.unsubscribe(MessageType.REVIEW_UPDATE, handleReviewUpdate);
      vscodeBridge.unsubscribe(MessageType.EXECUTION_STATUS, handleExecutionStatus);
    };
  }, []);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    if (changedFiles.length > 0) {
      setSelectedFile(changedFiles[0]);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
  };

  console.log("__REVIEW_BUTTON_RENDERED__");

  return (
    <>
      <div style={styles.bar}>
        <div style={styles.left}>
          {/* Back Arrow */}
          <button style={styles.backButton} title="Go back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Document Icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#8c8c8c' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>

          {/* Text */}
          <span style={styles.text}>{changedFiles.length} Files With Changes</span>
        </div>

        <div style={styles.right}>
          <button style={styles.reviewButton} onClick={handleOpenDialog}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Review Changes
          </button>
        </div>
      </div>

      {isDialogOpen && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogContainer}>
            <div style={styles.dialogHeader}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Review Generated Changes</h3>
              <button style={styles.closeButton} onClick={handleCloseDialog}>✕</button>
            </div>
            
            <div style={styles.dialogBody}>
              {changedFiles.length === 0 ? (
                <div style={styles.noFiles}>No generated files available.</div>
              ) : (
                <>
                  <div style={styles.fileList}>
                    {changedFiles.map((file) => (
                      <div
                        key={file}
                        onClick={() => setSelectedFile(file)}
                        style={{
                          ...styles.fileItem,
                          backgroundColor: selectedFile === file ? '#37373d' : 'transparent',
                          color: selectedFile === file ? '#fff' : '#cccccc'
                        }}
                      >
                        📄 {file}
                      </div>
                    ))}
                  </div>
                  <div style={styles.fileContentContainer}>
                    <div style={styles.fileContentHeader}>
                      <span>{selectedFile}</span>
                    </div>
                    <div style={styles.fileContent}>
                      {selectedFile ? (() => {
                        const diffString = fileContents[selectedFile] || '';
                        const lines = diffString.split('\n');
                        return (
                          <div style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '11.5px', lineHeight: '1.6' }}>
                            {lines.map((line, idx) => {
                              let backgroundColor = 'transparent';
                              let textColor = '#c9d1d9';
                              let borderLeft = '2px solid transparent';
                              
                              if (line.startsWith('+')) {
                                backgroundColor = 'rgba(46, 160, 67, 0.15)';
                                textColor = '#3fb950';
                                borderLeft = '2px solid #3fb950';
                              } else if (line.startsWith('-')) {
                                backgroundColor = 'rgba(248, 81, 73, 0.1)';
                                textColor = '#ff7b72';
                                borderLeft = '2px solid #f85149';
                              }

                              return (
                                <div 
                                  key={idx} 
                                  style={{ 
                                    backgroundColor, 
                                    color: textColor, 
                                    padding: '2px 8px',
                                    whiteSpace: 'pre-wrap',
                                    borderLeft
                                  }}
                                >
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })() : (
                        <div style={{ padding: '16px', color: '#8c8c8c' }}>Select a file to review content.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderBottom: 'none',
    padding: '4px 16px',
    height: '36px',
    boxSizing: 'border-box' as 'border-box',
    flexShrink: 0
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#8c8c8c',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    '&:hover': {
      color: '#cccccc',
      backgroundColor: '#2d2d2d'
    }
  },
  text: {
    fontSize: '12px',
    color: '#cccccc',
    fontWeight: 500
  },
  right: {
    display: 'flex',
    alignItems: 'center'
  },
  reviewButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#252526',
    border: '1px solid #3c3c3c',
    color: '#cccccc',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold' as 'bold',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#2d2d2d',
      borderColor: '#4c4c4c'
    }
  },
  dialogOverlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  },
  dialogContainer: {
    width: '600px',
    height: '450px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #3c3c3c',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #2d2d2d',
    flexShrink: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#8c8c8c',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      color: '#fff'
    }
  },
  dialogBody: {
    display: 'flex',
    flexDirection: 'row' as 'row',
    flex: 1,
    overflow: 'hidden'
  },
  noFiles: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    color: '#8c8c8c',
    fontStyle: 'italic'
  },
  fileList: {
    width: '200px',
    borderRight: '1px solid #2d2d2d',
    overflowY: 'auto' as 'auto',
    padding: '8px 0',
    flexShrink: 0
  },
  fileItem: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.2s'
  },
  fileContentContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    flex: 1,
    overflow: 'hidden'
  },
  fileContentHeader: {
    padding: '8px 16px',
    borderBottom: '1px solid #2d2d2d',
    fontSize: '11px',
    color: '#8c8c8c',
    backgroundColor: '#1a1a1a',
    flexShrink: 0
  },
  fileContent: {
    margin: 0,
    padding: '16px',
    overflow: 'auto' as 'auto',
    flex: 1,
    fontFamily: 'Consolas, Monaco, monospace',
    fontSize: '12px',
    color: '#d4d4d4',
    backgroundColor: '#1e1e1e',
    whiteSpace: 'pre-wrap' as 'pre-wrap'
  }
};
