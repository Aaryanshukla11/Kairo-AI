import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useModelContext } from '../../context/ModelContext';
import { promptService } from '../../services/promptService';
import { vscodeBridge } from '../../services/vscodeBridge';
import { logKairoStage } from '../../../common/kairoLogger';

export function PromptComposer({ isLandingPage }: { isLandingPage?: boolean } = {}): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMicHovered, setIsMicHovered] = useState(false);
  const [isPlusHovered, setIsPlusHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const { chatState, setChatState } = useAppContext();
  const { activeModel, installedModels, loading, switchModel, refreshModels } = useModelContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // 13.5px font-size with 1.4 line-height is approx 19px per line
      const lineHeight = 19;
      const minHeight = isLandingPage ? 38 : 19;
      const maxHeight = lineHeight * 16;
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputValue, isLandingPage]);

  const handleVoiceInput = () => {
    setInputValue('Listening...');
    setTimeout(() => {
      setInputValue('create calculator with history');
    }, 1500);
  };

  const handleAddActions = () => {
    vscodeBridge.postMessage({
      type: 'UPLOAD_ASSETS_REQUEST'
    } as any);
  };

  const handleSend = () => {
    if (!inputValue.trim() || chatState.isTyping) return;

    const messageId = Date.now().toString();
    
    // Append user message immediately
    setChatState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: messageId,
          role: 'USER',
          timestamp: Date.now(),
          content: inputValue,
          status: 'SUCCESS'
        }
      ],
      isTyping: true
    }));

    const executionId = `exec-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('Webview', 'ENTER', executionId, { prompt: inputValue });

    // Send through IPC
    promptService.requestPlan(inputValue)
      .then((payload) => {
        logKairoStage('Webview', 'EXIT', executionId, { prompt: inputValue }, { hasPayload: !!payload }, Date.now() - startTime);
        setChatState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `plan-${Date.now()}`,
              role: 'PLAN_PROPOSAL',
              timestamp: Date.now(),
              content: '',
              status: 'SUCCESS',
              plan: payload?.plan,
              approval: payload?.approval
            }
          ],
          isTyping: false
        }));
      })
      .catch((error) => {
        logKairoStage('Webview', 'ERROR', executionId, { prompt: inputValue }, null, Date.now() - startTime, error);
        setChatState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `error-${Date.now()}`,
              role: 'ERROR',
              timestamp: Date.now(),
              content: error.message,
              status: 'ERROR'
            }
          ],
          isTyping: false
        }));
      });

    // Clear input
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to resolve status indicator dot
  const getStatusDot = (status: string) => {
    switch (status) {
      case 'ready': return '🟢';
      case 'busy': return '🔵';
      case 'loading': return '🟡';
      case 'offline': return '🔴';
      default: return '🟢';
    }
  };

  const getStatusLabel = (status: string, displayName: string) => {
    switch (status) {
      case 'busy': return 'Thinking...';
      case 'loading': return 'Loading...';
      case 'offline': return 'No Runtime Connected';
      default: return displayName || 'Qwen2.5 Coder 7B';
    }
  };

  const outerContainerStyle = isLandingPage
    ? {
        padding: '0',
        backgroundColor: 'transparent',
        width: '100%',
        boxSizing: 'border-box' as 'border-box',
        flexShrink: 0
      }
    : styles.outerContainer;

  const composerContainerStyle = isLandingPage
    ? {
        display: 'flex',
        flexDirection: 'column' as 'column',
        backgroundColor: '#202023',
        border: '1px solid #333338',
        borderRadius: '16px',
        padding: '12px 16px',
        gap: '8px',
        boxSizing: 'border-box' as 'border-box',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
      }
    : styles.composerContainer;

  return (
    <div style={outerContainerStyle}>
      <div style={composerContainerStyle}>
        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          style={styles.textarea}
          placeholder="Ask anything, @ to mention, / for actions"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={chatState.isTyping}
          rows={isLandingPage ? 2 : 1}
        />

        {/* Bottom Toolbar Row */}
        <div style={styles.toolbarRow}>
          {/* Left Side: Plus and Dynamic Model Selector */}
          <div style={styles.leftGroup}>
            <button
              style={{
                ...styles.plusButton,
                color: isPlusHovered ? '#ffffff' : '#8c8c8c',
                backgroundColor: isPlusHovered ? '#2d2d2d' : 'transparent'
              }}
              title="Add actions / files"
              onClick={handleAddActions}
              onMouseEnter={() => setIsPlusHovered(true)}
              onMouseLeave={() => setIsPlusHovered(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {/* Dynamic Active Model Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  ...styles.modelDropdown,
                  color: isDropdownHovered ? '#ffffff' : '#8c8c8c',
                  backgroundColor: isDropdownHovered ? '#2d2d2d' : 'transparent'
                }}
                onClick={() => setIsMenuOpen(prev => !prev)}
                onMouseEnter={() => setIsDropdownHovered(true)}
                onMouseLeave={() => setIsDropdownHovered(false)}
                title={`${activeModel.provider || 'Google'} • ${activeModel.local ? 'Local' : 'Cloud'}`}
              >
                <span>{activeModel.displayName}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '4px' }}>
                  <polyline points={isMenuOpen ? "6 15 12 9 18 15" : "18 15 12 9 6 15"} />
                </svg>
              </button>

              {/* Model Selection Dropdown Popup */}
              {isMenuOpen && (
                <div style={styles.menuPopup}>
                  <div style={styles.menuHeader}>
                    <div style={{ fontWeight: 'bold', color: '#e0e0e0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{getStatusDot(activeModel.status)}</span>
                      <span>{activeModel.displayName}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>
                      {activeModel.provider} • {activeModel.local ? 'Local Runtime' : 'Cloud API'} ({Math.round(activeModel.contextWindow / 1024)}k context)
                    </div>
                  </div>

                  <div style={styles.menuDivider} />

                  <div style={styles.sectionLabel}>INSTALLED MODELS</div>

                  <div style={styles.menuList}>
                    {installedModels.length > 0 ? (
                      installedModels.map((m) => {
                        const isActive = m.id === activeModel.id || m.displayName === activeModel.displayName;
                        return (
                          <div
                            key={m.id}
                            style={{
                              ...styles.menuItem,
                              backgroundColor: isActive ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
                              borderLeft: isActive ? '3px solid #4caf50' : '3px solid transparent'
                            }}
                            onClick={() => {
                              switchModel(m.id);
                              setIsMenuOpen(false);
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#4caf50' : '#d0d0d0' }}>
                                {isActive ? '✓ ' : ''}{m.displayName}
                              </span>
                              <span style={styles.pillBadge}>{m.provider}</span>
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#777777', marginTop: '2px' }}>
                              {m.description || `${Math.round(m.contextWindow / 1024)}k context window`}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '8px 12px', color: '#888', fontSize: '11px' }}>
                        {loading ? 'Refreshing installed models...' : 'No external models detected. Standard runtime active.'}
                      </div>
                    )}
                  </div>

                  <div style={styles.menuDivider} />

                  <div
                    style={styles.menuActionItem}
                    onClick={() => {
                      refreshModels();
                    }}
                  >
                    <span>🔄 Refresh Installed Models</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Microphone voice input */}
          <div style={styles.rightGroup}>
            <button
              style={{
                ...styles.micButton,
                color: isMicHovered ? '#ffffff' : '#8c8c8c',
                backgroundColor: isMicHovered ? '#3d3d3d' : '#2d2d2d'
              }}
              title="Voice input"
              onClick={handleVoiceInput}
              onMouseEnter={() => setIsMicHovered(true)}
              onMouseLeave={() => setIsMicHovered(false)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    padding: '12px 16px',
    backgroundColor: '#121212',
    borderTop: 'none',
    width: '100%',
    boxSizing: 'border-box' as 'border-box',
    flexShrink: 0
  },
  composerContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    backgroundColor: '#1e1e1e',
    border: '1px solid #2d2d2d',
    borderRadius: '12px',
    padding: '8px 12px',
    gap: '6px',
    boxSizing: 'border-box' as 'border-box',
    width: '100%'
  },
  textarea: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#cccccc',
    fontSize: '13.5px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    outline: 'none',
    resize: 'none' as 'none',
    width: '100%',
    padding: '4px 0',
    minHeight: '28px',
    boxSizing: 'border-box' as 'border-box',
    lineHeight: '1.4'
  },
  toolbarRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: '2px'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  plusButton: {
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
  modelDropdown: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#8c8c8c',
    fontSize: '12px',
    fontWeight: 'bold' as 'bold',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '4px',
    '&:hover': {
      color: '#cccccc',
      backgroundColor: '#2d2d2d'
    }
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center'
  },
  micButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    border: 'none',
    color: '#8c8c8c',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    cursor: 'pointer',
    '&:hover': {
      color: '#cccccc',
      backgroundColor: '#3d3d3d'
    }
  },
  menuPopup: {
    position: 'absolute' as 'absolute',
    bottom: '32px',
    left: '0',
    width: '260px',
    backgroundColor: '#1e1e1e',
    border: '1px solid #333333',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    padding: '8px 0',
    fontSize: '12px'
  },
  menuHeader: {
    padding: '8px 12px'
  },
  menuDivider: {
    height: '1px',
    backgroundColor: '#2d2d2d',
    margin: '6px 0'
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 'bold' as 'bold',
    color: '#777777',
    padding: '4px 12px',
    letterSpacing: '0.5px'
  },
  menuList: {
    maxHeight: '180px',
    overflowY: 'auto' as 'auto'
  },
  menuItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease'
  },
  pillBadge: {
    fontSize: '9.5px',
    backgroundColor: '#2b2b2b',
    color: '#999999',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: 'bold' as 'bold'
  },
  menuActionItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    color: '#4caf50',
    fontWeight: 'bold' as 'bold',
    fontSize: '11.5px',
    '&:hover': {
      backgroundColor: '#2a2a2a'
    }
  }
};
