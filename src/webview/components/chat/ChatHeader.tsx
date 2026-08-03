import React from 'react';

export function ChatHeader(): React.JSX.Element {
  return (
    <header className="chat-header">
      <div className="chat-header-identity">
        <div className="chat-header-avatar" style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          backgroundColor: 'var(--primary, #007acc)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <path d="M12 8v14" />
            <path d="M16 12h4" />
            <path d="M4 12h4" />
          </svg>
        </div>
        <h1 className="chat-header-title">Kaira AI</h1>
        <span className="chat-status-badge" style={{
          fontSize: '10px',
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: '10px',
          backgroundColor: 'rgba(78, 201, 176, 0.15)',
          color: '#4ec9b0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ec9b0', display: 'inline-block' }}></span>
          Running
        </span>
      </div>
      <div className="chat-header-actions">
        <button className="header-icon-button" title="New Session" aria-label="New Session">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button className="header-icon-button" title="History" aria-label="History">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button className="header-icon-button" title="Stop Task" aria-label="Stop Task">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>
        <button className="header-icon-button" title="Settings" aria-label="Settings">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
        <button className="header-icon-button" title="More" aria-label="More">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
