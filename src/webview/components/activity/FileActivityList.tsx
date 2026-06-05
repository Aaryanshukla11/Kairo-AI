import React from 'react';
import { FileActivityRow, IFileActivityItem } from './FileActivityRow';

export function FileActivityList({ files }: { files: IFileActivityItem[] }): React.JSX.Element {
  if (files.length === 0) return <React.Fragment />;

  return (
    <div style={styles.container}>
      <div style={styles.sectionHeader}>File Activity ({files.length}):</div>
      <div style={styles.list}>
        {files.map((file) => (
          <FileActivityRow key={file.filePath} file={file} />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '10px',
    borderTop: '1px solid #21262d',
    paddingTop: '8px'
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '240px',
    overflowY: 'auto'
  }
};
