import React from 'react';

interface FileIconProps {
  filePath: string;
  size?: number;
}

export function FileIconResolver({ filePath, size = 14 }: FileIconProps): React.JSX.Element {
  const ext = (filePath.split('.').pop() || '').toLowerCase();
  const basename = filePath.split(/[/\\]/).pop() || '';

  // Determine icon symbol and color based on file extension
  let symbol = '📄';
  let badgeText = ext.toUpperCase().slice(0, 3);
  let color = '#8b949e';
  let bg = '#21262d';

  if (ext === 'ts') {
    symbol = 'TS';
    badgeText = 'TS';
    color = '#3178c6';
    bg = 'rgba(49, 120, 198, 0.18)';
  } else if (ext === 'tsx') {
    symbol = 'TSX';
    badgeText = 'TSX';
    color = '#3178c6';
    bg = 'rgba(49, 120, 198, 0.22)';
  } else if (ext === 'js') {
    symbol = 'JS';
    badgeText = 'JS';
    color = '#f7df1e';
    bg = 'rgba(247, 223, 30, 0.18)';
  } else if (ext === 'jsx') {
    symbol = 'JSX';
    badgeText = 'JSX';
    color = '#61dafb';
    bg = 'rgba(97, 218, 251, 0.18)';
  } else if (ext === 'html' || ext === 'htm') {
    symbol = 'HTML';
    badgeText = 'HTML';
    color = '#e34f26';
    bg = 'rgba(227, 79, 38, 0.18)';
  } else if (ext === 'css' || ext === 'scss' || ext === 'sass' || ext === 'less') {
    symbol = 'CSS';
    badgeText = 'CSS';
    color = '#1572b6';
    bg = 'rgba(21, 114, 182, 0.18)';
  } else if (ext === 'json') {
    symbol = '{}';
    badgeText = 'JSON';
    color = '#cbcb41';
    bg = 'rgba(203, 203, 65, 0.18)';
  } else if (ext === 'md' || ext === 'markdown') {
    symbol = 'M↓';
    badgeText = 'MD';
    color = '#42a5f5';
    bg = 'rgba(66, 165, 245, 0.18)';
  } else if (ext === 'py') {
    symbol = 'PY';
    badgeText = 'PY';
    color = '#3776ab';
    bg = 'rgba(55, 118, 171, 0.18)';
  } else if (basename.startsWith('.env') || ext === 'env') {
    symbol = '⚙';
    badgeText = 'ENV';
    color = '#ecd53f';
    bg = 'rgba(236, 213, 63, 0.18)';
  } else if (ext === 'yml' || ext === 'yaml') {
    symbol = 'YML';
    badgeText = 'YML';
    color = '#cb171e';
    bg = 'rgba(203, 23, 30, 0.18)';
  } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
    symbol = '🖼';
    badgeText = 'IMG';
    color = '#a371f7';
    bg = 'rgba(163, 113, 247, 0.18)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: 700,
        fontFamily: 'SFMono-Regular, Consolas, monospace',
        color,
        backgroundColor: bg,
        border: `1px solid ${color}44`,
        borderRadius: '3px',
        padding: '1px 3px',
        minWidth: `${size + 4}px`,
        height: `${size}px`,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0
      }}
      title={`${ext.toUpperCase()} File`}
    >
      {badgeText}
    </span>
  );
}
