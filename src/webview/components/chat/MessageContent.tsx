import React from 'react';

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps): React.JSX.Element {
  const parseLine = (line: string, index: number) => {
    // 1. Check if line starts with bullet point
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');
    let cleanLine = line;
    if (isBullet) {
      cleanLine = line.trim().substring(1).trim();
    }

    // 2. Tokenize by tags and backticks
    // We want to match:
    // - `code` blocks
    // - TS badge
    // - M+ badge
    const tokens: React.JSX.Element[] = [];
    let remaining = cleanLine;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Find matches for `code`, TS, or M+
      const backtickIdx = remaining.indexOf('`');
      const tsIdx = remaining.indexOf('TS ');
      const mPlusIdx = remaining.indexOf('M+ ');

      // Find the first occurrence
      const indices = [
        { type: 'backtick', index: backtickIdx },
        { type: 'ts', index: tsIdx },
        { type: 'mplus', index: mPlusIdx }
      ].filter(x => x.index !== -1).sort((a, b) => a.index - b.index);

      if (indices.length === 0) {
        tokens.push(<span key={`text-${index}-${keyIdx++}`}>{remaining}</span>);
        break;
      }

      const match = indices[0];
      if (match.index > 0) {
        tokens.push(<span key={`text-${index}-${keyIdx++}`}>{remaining.substring(0, match.index)}</span>);
        remaining = remaining.substring(match.index);
      }

      if (match.type === 'backtick') {
        const nextBacktick = remaining.indexOf('`', 1);
        if (nextBacktick !== -1) {
          const codeText = remaining.substring(1, nextBacktick);
          tokens.push(
            <code key={`code-${index}-${keyIdx++}`} style={styles.codeTag}>
              {codeText}
            </code>
          );
          remaining = remaining.substring(nextBacktick + 1);
        } else {
          tokens.push(<span key={`text-${index}-${keyIdx++}`}>{remaining}</span>);
          break;
        }
      } else if (match.type === 'ts') {
        tokens.push(
          <span key={`ts-${index}-${keyIdx++}`} style={styles.badgeTs}>
            TS
          </span>
        );
        remaining = remaining.substring(3);
      } else if (match.type === 'mplus') {
        tokens.push(
          <span key={`mplus-${index}-${keyIdx++}`} style={styles.badgeMPlus}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '3px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            M<sup>+</sup>
          </span>
        );
        remaining = remaining.substring(3);
      }
    }

    if (isBullet) {
      return (
        <div key={`line-${index}`} style={styles.bulletRow}>
          <span style={styles.bulletDot}>•</span>
          <div style={styles.bulletContent}>{tokens}</div>
        </div>
      );
    }

    return (
      <div key={`line-${index}`} style={styles.line}>
        {tokens}
      </div>
    );
  };

  const lines = content.split('\n');

  return (
    <div className="message-content body" style={styles.container}>
      {lines.map((line, idx) => parseLine(line, idx))}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13.5px',
    lineHeight: '1.6',
    color: '#d4d4d4',
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px',
    width: '100%'
  },
  line: {
    width: '100%'
  },
  bulletRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
    paddingLeft: '4px'
  },
  bulletDot: {
    color: '#8c8c8c',
    fontSize: '14px',
    userSelect: 'none' as 'none'
  },
  bulletContent: {
    flex: 1
  },
  codeTag: {
    backgroundColor: '#2d2d2d',
    border: '1px solid #3c3c3c',
    color: '#e0e0e0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '12px',
    margin: '0 2px'
  },
  badgeTs: {
    backgroundColor: 'rgba(0, 122, 204, 0.15)',
    color: '#3b82f6',
    border: '1px solid rgba(0, 122, 204, 0.3)',
    borderRadius: '4px',
    padding: '1px 5px',
    fontSize: '11px',
    fontWeight: 'bold' as 'bold',
    marginRight: '6px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  badgeMPlus: {
    backgroundColor: 'rgba(78, 201, 176, 0.12)',
    color: '#4ec9b0',
    border: '1px solid rgba(78, 201, 176, 0.25)',
    borderRadius: '4px',
    padding: '1px 5px',
    fontSize: '11px',
    fontWeight: 'bold' as 'bold',
    marginRight: '6px',
    display: 'inline-flex',
    alignItems: 'center'
  }
};
