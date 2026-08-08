import React from 'react';
import { MessageContent } from './MessageContent';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps): React.JSX.Element {
  return (
    <div className={`message-bubble-wrapper message-${role}`} style={styles.wrapper}>
      <div className="message-bubble-body" style={role === 'user' ? styles.userBody : styles.assistantBody}>
        <MessageContent content={content} />
        
        {role === 'assistant' && (
          <div style={styles.assistantFooter}>
            {/* Files changed summary block */}
            <div style={styles.filesChangedBar}>
              <div style={styles.filesChangedText}>
                <span>59 files changed</span>
                <span style={{ color: '#4ec9b0', marginLeft: '8px', fontWeight: 'bold' }}>+2251</span>
                <span style={{ color: '#f85149', marginLeft: '6px', fontWeight: 'bold' }}>-22</span>
                <span style={{ marginLeft: '12px', color: '#8c8c8c' }}>&gt;</span>
              </div>
              <button style={styles.reviewButton}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Review
              </button>
            </div>

            {/* Action icons (Copy, Thumbs Up, Thumbs Down) */}
            <div style={styles.actionIconsRow}>
              {/* Copy Icon */}
              <button style={styles.iconButton} title="Copy response">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              {/* Thumbs Up Icon */}
              <button style={styles.iconButton} title="Thumbs up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
              </button>
              {/* Thumbs Down Icon */}
              <button style={styles.iconButton} title="Thumbs down">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    width: '100%',
    margin: '4px 0',
    padding: '0'
  },
  userBody: {
    backgroundColor: '#1d1d1f',
    border: '1px solid #333335',
    padding: '12px 16px',
    borderRadius: '12px',
    maxWidth: '100%',
    width: '100%',
    boxSizing: 'border-box' as 'border-box'
  },
  assistantBody: {
    padding: '0',
    maxWidth: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as 'column',
    boxSizing: 'border-box' as 'border-box'
  },
  assistantFooter: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px',
    width: '100%'
  },
  filesChangedBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    border: '1px solid #2d2d2d',
    borderRadius: '6px',
    padding: '6px 12px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box' as 'border-box'
  },
  filesChangedText: {
    fontSize: '13px',
    color: '#cccccc',
    display: 'flex',
    alignItems: 'center'
  },
  reviewButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    border: '1px solid #3c3c3c',
    color: '#cccccc',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold' as 'bold',
    cursor: 'pointer'
  },
  actionIconsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '4px'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    color: '#858585',
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
  }
};
