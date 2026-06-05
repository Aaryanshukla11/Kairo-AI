import React from 'react';

export interface IStageActivityItemData {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export function StageActivityItem({ stage }: { stage: IStageActivityItemData }): React.JSX.Element {
  const isActive = stage.status === 'active';
  const isCompleted = stage.status === 'completed';
  const isFailed = stage.status === 'failed';

  const icon = isActive ? '⟳' : isCompleted ? '✓' : isFailed ? '❌' : '○';
  const borderColor = isCompleted ? '#3fb950' : isActive ? '#58a6ff' : isFailed ? '#f85149' : '#30363d';
  const color = isCompleted ? '#3fb950' : isActive ? '#58a6ff' : isFailed ? '#f85149' : '#8b949e';

  return (
    <div style={{
      ...styles.item,
      borderColor,
      color,
      backgroundColor: isActive ? 'rgba(88, 166, 255, 0.08)' : 'transparent'
    }}>
      <span style={{ fontWeight: 'bold', width: '12px', textAlign: 'center' }}>{icon}</span>
      <span style={{ fontWeight: isActive ? 600 : 400 }}>{stage.label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '11px'
  }
};
