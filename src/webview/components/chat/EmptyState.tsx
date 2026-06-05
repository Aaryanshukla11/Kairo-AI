import React from 'react';

export function EmptyState(): React.JSX.Element {
  return (
    <div className="chat-empty-state" style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.logo}>✨</div>
        <h2 style={styles.title}>How can I help you build today?</h2>
        <p style={styles.subtitle}>
          Ask me to create a project, modify code, or explain concepts. Everything runs locally and offline.
        </p>
      </div>

      <div style={styles.suggestionsContainer}>
        <div style={styles.suggestionCard}>
          <div style={styles.suggestionIcon}>🧮</div>
          <div style={styles.suggestionTitle}>"Create a Calculator"</div>
          <div style={styles.suggestionDesc}>Build a web calculator with HTML, CSS, and JS.</div>
        </div>
        <div style={styles.suggestionCard}>
          <div style={styles.suggestionIcon}>📝</div>
          <div style={styles.suggestionTitle}>"Build React Todo App"</div>
          <div style={styles.suggestionDesc}>Scaffold a structured interactive task list.</div>
        </div>
        <div style={styles.suggestionCard}>
          <div style={styles.suggestionIcon}>🚀</div>
          <div style={styles.suggestionTitle}>"Build Express API"</div>
          <div style={styles.suggestionDesc}>Initialize a backend server with router.</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#e0e0e0',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  hero: {
    marginBottom: '32px',
    maxWidth: '360px',
    textAlign: 'center' as 'center'
  },
  logo: {
    fontSize: '36px',
    marginBottom: '12px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '12px',
    color: '#8c8c8c',
    margin: 0,
    lineHeight: '1.5'
  },
  suggestionsContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '320px'
  },
  suggestionCard: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'flex-start',
    backgroundColor: '#1c1c1e',
    border: '1px solid #2c2c2e',
    borderRadius: '8px',
    padding: '12px 16px',
    textAlign: 'left' as 'left',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  suggestionIcon: {
    fontSize: '18px',
    marginBottom: '6px'
  },
  suggestionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '4px'
  },
  suggestionDesc: {
    fontSize: '11px',
    color: '#8c8c8c',
    lineHeight: '1.4'
  }
};
