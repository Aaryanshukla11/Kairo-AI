import React from 'react';
import { StageActivityItem, IStageActivityItemData } from './StageActivityItem';

export function StageActivityList({ stages }: { stages: IStageActivityItemData[] }): React.JSX.Element {
  if (stages.length === 0) return <React.Fragment />;

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>Pipeline Activity:</div>
      <div style={styles.grid}>
        {stages.map((stage) => (
          <StageActivityItem key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '10px'
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  }
};
