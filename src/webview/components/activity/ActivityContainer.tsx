import React, { useState } from 'react';
import { ActivityHeader } from './ActivityHeader';
import { StageActivityList } from './StageActivityList';
import { IStageActivityItemData } from './StageActivityItem';
import { FileActivityList } from './FileActivityList';
import { IFileActivityItem } from './FileActivityRow';

export interface ActivityContainerProps {
  taskComplexity?: 'SMALL' | 'MEDIUM' | 'COMPLEX';
  currentActivity: string;
  overallStatus: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  stages: IStageActivityItemData[];
  files: IFileActivityItem[];
}

export function ActivityContainer({
  taskComplexity = 'COMPLEX',
  currentActivity,
  overallStatus,
  stages,
  files
}: ActivityContainerProps): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // SMALL TASK: compact inline rendering
  if (taskComplexity === 'SMALL') {
    const isRunning = overallStatus === 'running';
    const isCompleted = overallStatus === 'completed';
    const isFailed = overallStatus === 'failed';
    const icon = isRunning ? '⟳' : isCompleted ? '✓' : isFailed ? '❌' : '○';
    const color = isRunning ? '#58a6ff' : isCompleted ? '#3fb950' : isFailed ? '#f85149' : '#8b949e';

    return (
      <div style={styles.inlineRow}>
        <span style={{ color, fontWeight: 'bold' }}>{icon}</span>
        <span style={{ color: '#e6edf3', fontSize: '13px' }}>{currentActivity || (isCompleted ? 'Task completed' : 'Processing...')}</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ActivityHeader
        currentActivity={currentActivity}
        overallStatus={overallStatus}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <div style={styles.expandedContent}>
          <StageActivityList stages={stages} />
          <FileActivityList files={files} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  inlineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    margin: '8px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  container: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '12px 14px',
    margin: '10px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#c9d1d9'
  },
  expandedContent: {
    marginTop: '12px',
    borderTop: '1px solid #21262d',
    paddingTop: '10px'
  }
};
