import React from 'react';

export interface IFileActivityItem {
  filePath: string;
  status: 'PENDING' | 'GENERATING' | 'GENERATED' | 'WRITING' | 'CREATED' | 'FAILED';
  error?: string;
}

export function FileActivityRow({ file }: { file: IFileActivityItem }): React.JSX.Element {
  const isGenerating = file.status === 'GENERATING';
  const isWriting = file.status === 'WRITING';
  const isCreated = file.status === 'CREATED' || file.status === 'GENERATED';
  const isFailed = file.status === 'FAILED';

  const icon = isGenerating || isWriting ? '⟳' : isCreated ? '✓' : isFailed ? '❌' : '○';
  const iconColor = isGenerating || isWriting ? '#58a6ff' : isCreated ? '#3fb950' : isFailed ? '#f85149' : '#8b949e';
  const statusLabel = isGenerating ? 'Generating...' : isWriting ? 'Writing...' : isCreated ? 'Created' : isFailed ? 'Failed' : 'Pending';

  return (
    <div style={styles.row}>
      <span style={{ ...styles.icon, color: iconColor, animation: isGenerating || isWriting ? 'kairoSpin 1.2s linear infinite' : 'none' }}>
        {icon}
      </span>
      <span style={styles.path} title={file.filePath}>
        {file.filePath}
      </span>
      <span style={{
        ...styles.tag,
        color: iconColor,
        backgroundColor: isGenerating || isWriting ? 'rgba(88, 166, 255, 0.12)' : isCreated ? 'rgba(63, 185, 80, 0.12)' : isFailed ? 'rgba(248, 81, 73, 0.12)' : 'transparent'
      }}>
        {statusLabel}
      </span>
      {file.error && <span style={styles.errorText}>{file.error}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 6px',
    fontSize: '12px',
    borderRadius: '4px',
    backgroundColor: '#0d1117',
    marginBottom: '3px'
  },
  icon: {
    fontSize: '12px',
    fontWeight: 'bold',
    width: '14px',
    display: 'inline-block',
    textAlign: 'center'
  },
  path: {
    flex: 1,
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    color: '#e6edf3',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  tag: {
    fontSize: '10px',
    fontWeight: 500,
    padding: '1px 6px',
    borderRadius: '4px'
  },
  errorText: {
    fontSize: '11px',
    color: '#f85149',
    marginLeft: '6px'
  }
};
