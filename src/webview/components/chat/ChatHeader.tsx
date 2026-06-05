import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { vscodeBridge } from '../../services/vscodeBridge';
import { workspaceService } from '../../services/workspaceService';
import { WorkspaceSummary } from '../../../core/workspace/workspaceTypes';

export interface ChatHeaderProps {
  currentView: 'chat' | 'platform' | 'runtime' | 'release';
  setCurrentView: (view: 'chat' | 'platform' | 'runtime' | 'release') => void;
}

export function ChatHeader({ currentView, setCurrentView }: ChatHeaderProps): React.JSX.Element {
  const { chatState, setChatState } = useAppContext();
  const [folderName, setFolderName] = useState<string>('Kairo AI');

  useEffect(() => {
    workspaceService.getWorkspaceSummary()
      .then((summary) => {
        if (summary && (summary as WorkspaceSummary).projectName) {
          setFolderName((summary as WorkspaceSummary).projectName);
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  const handleNewChat = () => {
    setChatState({
      messages: [],
      isTyping: false,
      isStreaming: false
    });
  };

  const handleShowHistory = () => {
    const prompts = chatState.messages
      .filter(m => m.role === 'USER')
      .map(m => m.content);
    
    vscodeBridge.postMessage({
      type: 'SHOW_HISTORY',
      payload: { prompts }
    } as any);
  };

  const handleMoreOptions = () => {
    vscodeBridge.postMessage({
      type: 'MORE_OPTIONS'
    } as any);
  };

  const handleClosePanel = () => {
    vscodeBridge.postMessage({
      type: 'CLOSE_PANEL'
    } as any);
  };

  return (
    <header style={styles.header}>
      {/* Title section on the left */}
      <div style={styles.titleContainer}>
        <h1 style={styles.title} title={folderName}>
          Agent
        </h1>
      </div>

      {/* Action buttons on the right */}
      <div style={styles.actionsContainer}>
        {/* Plus Button */}
        <button style={styles.iconButton} title="New Session" onClick={handleNewChat}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* History / Clock Button */}
        <button style={styles.iconButton} title="Show history" onClick={handleShowHistory}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>

        {/* More Options Button */}
        <button style={styles.iconButton} title="More actions" onClick={handleMoreOptions}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {/* Close Button */}
        <button style={styles.iconButton} title="Close panel" onClick={handleClosePanel}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderBottom: '1px solid #2d2d2d',
    padding: '8px 16px',
    height: '40px',
    boxSizing: 'border-box' as 'border-box',
    flexShrink: 0
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '70%',
    overflow: 'hidden'
  },
  title: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 'normal' as 'normal',
    color: '#cccccc',
    whiteSpace: 'nowrap' as 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    color: '#8c8c8c',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
    '&:hover': {
      color: '#cccccc',
      backgroundColor: '#2d2d2d'
    }
  }
};
