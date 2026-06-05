import React, { useState, useEffect, useRef } from 'react';
import { ActivityHeader } from './ActivityHeader';
import { StageActivityList } from './StageActivityList';
import { IStageActivityItemData } from './StageActivityItem';
import { FileActivityList } from './FileActivityList';
import { IFileActivityItem } from './FileActivityRow';

export interface IActivityLogItem {
  id: string;
  timestamp: string;
  text: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface ActivityContainerProps {
  taskComplexity?: 'SMALL' | 'MEDIUM' | 'COMPLEX';
  currentActivity: string;
  overallStatus: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  stages: IStageActivityItemData[];
  files: IFileActivityItem[];
  logs?: IActivityLogItem[];
}

export function ActivityContainer({
  taskComplexity = 'COMPLEX',
  currentActivity,
  overallStatus,
  stages,
  files,
  logs = []
}: ActivityContainerProps): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const completedStages = stages.filter(s => s.status === 'completed').length;
  const progressPercent = Math.min(100, Math.round((completedStages / Math.max(1, stages.length)) * 100));

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, currentActivity]);

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

  const isRunning = overallStatus === 'running';
  const isCompleted = overallStatus === 'completed';
  const isFailed = overallStatus === 'failed';
  const progressColor = isFailed ? '#f85149' : isCompleted ? '#3fb950' : '#58a6ff';

  return (
    <div style={styles.container}>
      <ActivityHeader
        currentActivity={currentActivity}
        overallStatus={overallStatus}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Real-time Animated Progress Bar */}
      <div style={styles.progressBarTrack}>
        <div
          style={{
            ...styles.progressBarFill,
            width: `${overallStatus === 'completed' ? 100 : progressPercent}%`,
            backgroundColor: progressColor,
            boxShadow: isRunning ? '0 0 8px rgba(88, 166, 255, 0.6)' : 'none'
          }}
        />
      </div>

      {!isCollapsed && (
        <div style={styles.expandedContent}>
          <StageActivityList stages={stages} />
          <FileActivityList files={files} />

          {/* Real-Time Live Activity Feed Log (Antigravity Style) */}
          {logs && logs.length > 0 && (
            <div style={styles.logBox}>
              <div style={styles.logBoxHeader}>
                <span style={styles.liveDot} />
                <span>LIVE ACTIVITY FEED</span>
              </div>
              <div style={styles.logList}>
                {logs.map((log) => (
                  <div key={log.id} style={styles.logRow}>
                    <span style={styles.logTime}>{log.timestamp}</span>
                    <span
                      style={{
                        ...styles.logText,
                        color: log.type === 'error' ? '#f85149' : log.type === 'success' ? '#3fb950' : log.type === 'warning' ? '#d29922' : '#8b949e'
                      }}
                    >
                      {log.text}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}
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
    padding: '4px 0',
    margin: '6px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  container: {
    padding: '4px 0',
    margin: '8px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#c9d1d9'
  },
  progressBarTrack: {
    height: '2px',
    backgroundColor: '#21262d',
    borderRadius: '1px',
    overflow: 'hidden',
    marginTop: '6px'
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease'
  },
  expandedContent: {
    marginTop: '8px',
    paddingTop: '4px'
  },
  logBox: {
    marginTop: '8px',
    padding: '4px 0'
  },
  logBoxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    color: '#8b949e',
    marginBottom: '6px'
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3fb950',
    boxShadow: '0 0 6px #3fb950'
  },
  logList: {
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '11px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  logRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'baseline'
  },
  logTime: {
    color: '#484f58',
    fontSize: '10px',
    flexShrink: 0
  },
  logText: {
    wordBreak: 'break-word'
  }
};
