import React from 'react';

export interface ActivityHeaderProps {
  currentActivity: string;
  overallStatus: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ActivityHeader({
  currentActivity,
  overallStatus,
  isCollapsed,
  onToggleCollapse
}: ActivityHeaderProps): React.JSX.Element {
  const isRunning = overallStatus === 'running';
  const isCompleted = overallStatus === 'completed';
  const isFailed = overallStatus === 'failed';

  const icon = isRunning ? '⟳' : isCompleted ? '✓' : isFailed ? '❌' : '⏹';
  const iconColor = isRunning ? '#58a6ff' : isCompleted ? '#3fb950' : isFailed ? '#f85149' : '#8b949e';

  return (
    <div style={styles.header} onClick={onToggleCollapse}>
      <div style={styles.leftGroup}>
        <span style={{ ...styles.icon, color: iconColor }}>{icon}</span>
        <span style={styles.title}>{currentActivity || (isRunning ? 'Working on task...' : isCompleted ? 'Project completed' : isFailed ? 'Execution failed' : 'Idle')}</span>
      </div>
      <button style={styles.toggleButton} aria-label={isCollapsed ? 'Expand activity' : 'Collapse activity'}>
        {isCollapsed ? '▼' : '▲'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    overflow: 'hidden'
  },
  icon: {
    fontSize: '14px',
    fontWeight: 'bold'
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#f0f6fc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#8b949e',
    cursor: 'pointer',
    fontSize: '10px',
    padding: '2px 4px'
  }
};
