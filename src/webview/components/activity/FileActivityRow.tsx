import React from 'react';
import { FileIconResolver } from './FileIconResolver';

export interface IFileActivityItem {
  filePath: string;
  status: 'PENDING' | 'GENERATING' | 'GENERATED' | 'WRITING' | 'CREATED' | 'FAILED';
  error?: string;
}

export function FileActivityRow({ file }: { file: IFileActivityItem }): React.JSX.Element {
  const isGenerating = file.status === 'GENERATING';
  const isGenerated = file.status === 'GENERATED';
  const isWriting = file.status === 'WRITING';
  const isCreated = file.status === 'CREATED';
  const isFailed = file.status === 'FAILED';

  const icon = isGenerating || isWriting ? '⟳' : isCreated ? '✓' : isGenerated ? '◈' : isFailed ? '❌' : '○';
  const iconColor = isGenerating || isWriting ? '#58a6ff' : isCreated ? '#3fb950' : isGenerated ? '#a371f7' : isFailed ? '#f85149' : '#8b949e';
  const statusLabel = isGenerating ? 'Generating...' : isGenerated ? 'Generated' : isWriting ? 'Writing...' : isCreated ? 'Created' : isFailed ? 'Failed' : 'Pending';

  return (
    <div style={styles.row}>
      <span style={{ ...styles.icon, color: iconColor, animation: isGenerating || isWriting ? 'kairoSpin 1.2s linear infinite' : 'none' }}>
        {icon}
      </span>
      <FileIconResolver filePath={file.filePath} size={14} />
      <span style={styles.path} title={file.filePath}>
        {file.filePath}
      </span>
      <span style={{
        ...styles.tag,
        color: iconColor,
        backgroundColor: isGenerating || isWriting ? 'rgba(88, 166, 255, 0.12)' : isCreated ? 'rgba(63, 185, 80, 0.12)' : isGenerated ? 'rgba(163, 113, 247, 0.12)' : isFailed ? 'rgba(248, 81, 73, 0.12)' : 'transparent'
      }}>
        {statusLabel}
      </span>
      {file.error && <span style={styles.errorText} title={file.error}>{file.error}</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '3px 0',
    fontSize: '12px',
    backgroundColor: 'transparent',
    marginBottom: '2px'
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
