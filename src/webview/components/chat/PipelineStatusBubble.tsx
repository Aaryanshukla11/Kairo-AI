import React from 'react';

export interface PipelineStatusEntry {
  stage: string;
  detail: string;
  status: 'running' | 'done' | 'error';
  timestamp: number;
}

interface PipelineStatusBubbleProps {
  entries: PipelineStatusEntry[];
}

export function PipelineStatusBubble({ entries }: PipelineStatusBubbleProps): React.JSX.Element | null {
  if (!entries || entries.length === 0) return null;

  return (
    <div style={styles.container}>
      {entries.map((entry, i) => (
        <div key={i} style={styles.row}>
          <span style={styles.icon(entry.status)}>
            {entry.status === 'running' ? '\u23f3' : entry.status === 'done' ? '\u2705' : '\u274c'}
          </span>
          <div style={styles.content}>
            <span style={styles.stage}>{entry.stage}</span>
            <span style={styles.detail}>{entry.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px 16px',
    borderLeft: '2px solid #10b981',
    backgroundColor: '#161618',
    borderRadius: '0 8px 8px 0',
    margin: '8px 0 8px 16px'
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start' as const,
    gap: '10px'
  },
  icon: (status: 'running' | 'done' | 'error') => ({
    fontSize: '13px',
    marginTop: '1px',
    flexShrink: 0
  }),
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px'
  },
  stage: {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#e0e0e0',
    letterSpacing: '0.01em'
  },
  detail: {
    fontSize: '11.5px',
    color: '#a0a0a0',
    lineHeight: '1.4'
  }
};
