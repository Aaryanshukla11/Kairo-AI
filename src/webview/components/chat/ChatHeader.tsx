import React from 'react';

export function ChatHeader(): React.JSX.Element {
  return (
    <header className="chat-header">
      <div className="chat-header-identity">
        <h1 className="chat-header-title">Sasta-Antigravity</h1>
      </div>
      <div className="chat-header-actions">
        <button className="header-icon-button" title="New Session" aria-label="New Session">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button className="header-icon-button" title="History" aria-label="History">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button className="header-icon-button" title="More" aria-label="More">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
