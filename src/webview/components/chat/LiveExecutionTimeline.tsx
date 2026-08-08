import React from 'react';
import { IExecutionEventPayload } from '../../../common/protocol/messageTypes';

interface LiveExecutionTimelineProps {
  events: IExecutionEventPayload[];
}

export function LiveExecutionTimeline({ events }: LiveExecutionTimelineProps): React.JSX.Element | null {
  if (!events || events.length === 0) return null;

  // Group events by stage while preserving chronological order of stages
  const stageGroups: { stage: string; items: IExecutionEventPayload[] }[] = [];
  
  for (const evt of events) {
    let group = stageGroups.find(g => g.stage === evt.stage);
    if (!group) {
      group = { stage: evt.stage, items: [] };
      stageGroups.push(group);
    }
    // Update or append substage item
    const existingIdx = group.items.findIndex(i => i.substage === evt.substage);
    if (existingIdx !== -1) {
      group.items[existingIdx] = evt;
    } else {
      group.items.push(evt);
    }
  }

  const formatElapsed = (ms: number): string => {
    if (ms < 1000) return `+${ms}ms`;
    return `+${(ms / 1000).toFixed(1)}s`;
  };

  const getStageHeaderIcon = (stageName: string, items: IExecutionEventPayload[]): string => {
    const hasError = items.some(i => i.status === 'error');
    if (hasError) return '❌';
    const isRunning = items.some(i => i.status === 'running');
    if (isRunning) return '⏳';
    const hasWarning = items.some(i => i.status === 'warning');
    if (hasWarning) return '👤';

    switch (stageName) {
      case 'Workspace Scan': return '✅';
      case 'Intent Detection': return '🧠';
      case 'AI Kernel': return '🧠';
      case 'Model Router': return '🤖';
      case 'Ollama': return '⚡';
      case 'Planning': return '📋';
      case 'Waiting for Approval': return '👤';
      case 'Executor': return '⚙';
      case 'Filesystem': return '📁';
      case 'Completed': return '✅';
      default: return '✅';
    }
  };

  return (
    <div style={styles.container}>
      {stageGroups.map((group) => {
        const headerIcon = getStageHeaderIcon(group.stage, group.items);
        const lastItem = group.items[group.items.length - 1];

        return (
          <div key={group.stage} style={styles.stageBlock}>
            {/* Stage Header */}
            <div style={styles.stageHeader}>
              <span style={styles.headerIcon}>{headerIcon}</span>
              <span style={styles.stageTitle}>{group.stage}</span>
              {lastItem && (
                <span style={styles.elapsedTag}>{formatElapsed(lastItem.elapsedMs)}</span>
              )}
            </div>

            {/* Substage Items */}
            <div style={styles.itemList}>
              {group.items.map((item) => (
                <div key={item.id} style={styles.itemRow}>
                  {/* Status Indicator */}
                  <span style={styles.statusBullet}>
                    {item.status === 'done' ? (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                    ) : item.status === 'running' ? (
                      <span style={{ color: '#3b82f6' }}>⏳</span>
                    ) : item.status === 'warning' ? (
                      <span style={{ color: '#f59e0b' }}>⚠️</span>
                    ) : (
                      <span style={{ color: '#ef4444' }}>❌</span>
                    )}
                  </span>

                  <div style={styles.itemContent}>
                    <div style={styles.substageText}>
                      <span>{item.substage}</span>
                      {item.message && (
                        <span style={styles.messageText}> {item.message}</span>
                      )}
                    </div>

                    {/* Metadata Badges (Model, File, Token Count, Progress) */}
                    <div style={styles.badgeRow}>
                      {item.model && (
                        <span style={styles.modelBadge}>🤖 {item.model}</span>
                      )}
                      {item.file && (
                        <span style={styles.fileBadge}>📄 {item.file}</span>
                      )}
                      {item.tokenCount !== undefined && item.tokenCount > 0 && (
                        <span style={styles.tokenBadge}>⚡ {item.tokenCount} tokens</span>
                      )}
                      {item.progress !== null && item.progress !== undefined && item.status === 'running' && (
                        <div style={styles.progressBarBg}>
                          <div style={{ ...styles.progressBarFill, width: `${item.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: '14px 16px',
    backgroundColor: '#161618',
    borderLeft: '3px solid #10b981',
    borderRadius: '0 8px 8px 0',
    margin: '8px 0 12px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  stageBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px'
  },
  stageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #28282b',
    paddingBottom: '4px'
  },
  headerIcon: {
    fontSize: '13px'
  },
  stageTitle: {
    fontSize: '12.5px',
    fontWeight: '700' as const,
    color: '#ffffff',
    letterSpacing: '0.02em'
  },
  elapsedTag: {
    marginLeft: 'auto',
    fontSize: '10px',
    color: '#6e6e73',
    fontFamily: 'monospace'
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
    paddingLeft: '4px'
  },
  itemRow: {
    display: 'flex',
    alignItems: 'flex-start' as const,
    gap: '8px'
  },
  statusBullet: {
    fontSize: '12px',
    marginTop: '1px',
    flexShrink: 0
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    flex: 1
  },
  substageText: {
    fontSize: '11.5px',
    color: '#d1d1d6',
    lineHeight: '1.4'
  },
  messageText: {
    color: '#98989d',
    fontWeight: 'normal' as const
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
    flexWrap: 'wrap' as const
  },
  modelBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: '600' as const
  },
  fileBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: '500' as const
  },
  tokenBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: '500' as const
  },
  progressBarBg: {
    width: '80px',
    height: '4px',
    backgroundColor: '#2c2c2e',
    borderRadius: '2px',
    overflow: 'hidden' as const,
    marginLeft: '4px'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.2s ease'
  }
};
