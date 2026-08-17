import React, { useState } from 'react';

interface MessageContentProps {
  content: string;
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function FilePill({ filename }: { filename: string }): React.JSX.Element {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  
  const isReact = ext === 'tsx' || ext === 'jsx';
  const isTs = ext === 'ts' || ext === 'js';

  return (
    <span style={styles.filePill}>
      {isReact ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="2" style={{ marginRight: '4px' }}>
          <circle cx="12" cy="12" r="2" fill="#61dafb" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
        </svg>
      ) : isTs ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3178c6" strokeWidth="2" style={{ marginRight: '4px' }}>
          <rect x="3" y="3" width="18" height="18" rx="3" fill="rgba(49,120,198,0.2)" stroke="#3178c6" />
          <text x="6" y="16" fill="#3178c6" fontSize="10" fontWeight="bold">TS</text>
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" strokeWidth="2" style={{ marginRight: '4px' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}
      <span style={{ fontFamily: 'SFMono-Regular, Consolas, monospace', fontSize: '12px', color: '#e4e4e7' }}>
        {filename}
      </span>
    </span>
  );
}

function CodeBlockComponent({ language, code }: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.codeBlockWrapper}>
      <div style={styles.codeBlockHeader}>
        <span style={styles.codeBlockLang}>{language || 'code'}</span>
        <div style={styles.codeBlockActions}>
          <button style={styles.codeBlockActionBtn} title="Mention">
            <span style={{ fontSize: '13px', lineHeight: 1 }}>@</span>
          </button>
          <button style={styles.codeBlockActionBtn} onClick={handleCopy} title="Copy code">
            {copied ? (
              <span style={{ fontSize: '11px', color: '#4ec9b0' }}>✓ Copied</span>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <pre style={styles.codePre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MessageContent({ content }: MessageContentProps): React.JSX.Element {
  if (!content) return <div />;

  // Parse markdown code blocks vs text blocks
  const blocks: Array<{ type: 'text' | 'code'; language?: string; content: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore.trim().length > 0) {
        blocks.push({ type: 'text', content: textBefore });
      }
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trimEnd()
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    if (textAfter.trim().length > 0) {
      blocks.push({ type: 'text', content: textAfter });
    }
  }

  const parseInlineElements = (text: string) => {
    const elements: React.JSX.Element[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Pattern to match `code`, **bold**, [file](path), or (file.tsx)
    const fileRegex = /\[([^\]]+\.(?:tsx|ts|jsx|js|json|html|css|md|py))\]\([^)]+\)/;
    const filePillRegex = /`([a-zA-Z0-9_\-]+\.(?:tsx|ts|jsx|js|json|html|css|md|py))`/;

    while (remaining.length > 0) {
      const codeIdx = remaining.indexOf('`');
      const boldIdx = remaining.indexOf('**');
      const fileMatch = fileRegex.exec(remaining);

      let firstMatch: { type: 'code' | 'bold' | 'fileLink'; index: number; matchStr?: string; fileName?: string } | null = null;

      if (codeIdx !== -1) {
        firstMatch = { type: 'code', index: codeIdx };
      }
      if (boldIdx !== -1 && (!firstMatch || boldIdx < firstMatch.index)) {
        firstMatch = { type: 'bold', index: boldIdx };
      }
      if (fileMatch && (!firstMatch || fileMatch.index < firstMatch.index)) {
        firstMatch = { type: 'fileLink', index: fileMatch.index, matchStr: fileMatch[0], fileName: fileMatch[1] };
      }

      if (!firstMatch) {
        elements.push(<span key={`txt-${keyIdx++}`}>{remaining}</span>);
        break;
      }

      if (firstMatch.index > 0) {
        elements.push(<span key={`txt-${keyIdx++}`}>{remaining.substring(0, firstMatch.index)}</span>);
        remaining = remaining.substring(firstMatch.index);
      }

      if (firstMatch.type === 'fileLink') {
        elements.push(<FilePill key={`file-${keyIdx++}`} filename={firstMatch.fileName!} />);
        remaining = remaining.substring(firstMatch.matchStr!.length);
      } else if (firstMatch.type === 'code') {
        const nextCode = remaining.indexOf('`', 1);
        if (nextCode !== -1) {
          const codeStr = remaining.substring(1, nextCode);
          // Check if code block contains a filename (e.g. `ChatTimeline.tsx`)
          if (/^[a-zA-Z0-9_\-]+\.(?:tsx|ts|jsx|js|json|html|css|md|py)$/.test(codeStr.trim())) {
            elements.push(<FilePill key={`filepill-${keyIdx++}`} filename={codeStr.trim()} />);
          } else {
            elements.push(
              <code key={`code-${keyIdx++}`} style={styles.inlineCode}>
                {codeStr}
              </code>
            );
          }
          remaining = remaining.substring(nextCode + 1);
        } else {
          elements.push(<span key={`txt-${keyIdx++}`}>{remaining}</span>);
          break;
        }
      } else if (firstMatch.type === 'bold') {
        const nextBold = remaining.indexOf('**', 2);
        if (nextBold !== -1) {
          const boldStr = remaining.substring(2, nextBold);
          elements.push(
            <strong key={`bold-${keyIdx++}`} style={{ fontWeight: 600, color: '#f4f4f5' }}>
              {boldStr}
            </strong>
          );
          remaining = remaining.substring(nextBold + 2);
        } else {
          elements.push(<span key={`txt-${keyIdx++}`}>{remaining}</span>);
          break;
        }
      }
    }

    return elements;
  };

  const renderTextBlock = (text: string, blockKey: number) => {
    const lines = text.split('\n');
    return (
      <div key={`block-${blockKey}`} style={styles.textBlockContainer}>
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={`empty-${lineIdx}`} style={{ height: '4px' }} />;
          }

          // Headers #, ##, ###
          if (line.startsWith('# ')) {
            return <h2 key={`h1-${lineIdx}`} style={styles.h1}>{parseInlineElements(line.substring(2))}</h2>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={`h2-${lineIdx}`} style={styles.h2}>{parseInlineElements(line.substring(3))}</h3>;
          }
          if (line.startsWith('### ')) {
            return <h4 key={`h3-${lineIdx}`} style={styles.h3}>{parseInlineElements(line.substring(4))}</h4>;
          }

          // Bullet point lists
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('* ') || trimmed.startsWith('- ');
          if (isBullet) {
            const bulletText = trimmed.replace(/^([•*-])\s*/, '');
            return (
              <div key={`bullet-${lineIdx}`} style={styles.bulletRow}>
                <span style={styles.bulletDot}>•</span>
                <div style={styles.bulletText}>{parseInlineElements(bulletText)}</div>
              </div>
            );
          }

          // Numbered lists e.g. "1. ", "2. "
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={`num-${lineIdx}`} style={styles.numRow}>
                <span style={styles.numLabel}>{numMatch[1]}.</span>
                <div style={styles.numText}>{parseInlineElements(numMatch[2])}</div>
              </div>
            );
          }

          return (
            <div key={`line-${lineIdx}`} style={styles.paragraphLine}>
              {parseInlineElements(line)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlockComponent key={`codeblock-${idx}`} language={block.language || 'code'} code={block.content} />;
        }
        return renderTextBlock(block.content, idx);
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '13.5px',
    lineHeight: '1.6',
    color: '#d4d4d8',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  textBlockContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    width: '100%'
  },
  paragraphLine: {
    width: '100%',
    wordBreak: 'break-word'
  },
  h1: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    marginTop: '6px',
    marginBottom: '2px'
  },
  h2: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#ffffff',
    marginTop: '4px',
    marginBottom: '2px'
  },
  h3: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f4f4f5',
    marginTop: '2px',
    marginBottom: '2px'
  },
  bulletRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
    paddingLeft: '18px',
    margin: '1px 0'
  },
  bulletDot: {
    color: '#a1a1aa',
    fontSize: '13px',
    lineHeight: '1.6',
    userSelect: 'none'
  },
  numRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    width: '100%',
    margin: '4px 0 2px 0'
  },
  numLabel: {
    color: '#f4f4f5',
    fontSize: '13.5px',
    fontWeight: 600,
    lineHeight: '1.6',
    userSelect: 'none'
  },
  numText: {
    flex: 1,
    wordBreak: 'break-word'
  },
  bulletText: {
    flex: 1,
    wordBreak: 'break-word'
  },
  filePill: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '5px',
    padding: '2px 7px 2px 6px',
    margin: '0 3px',
    verticalAlign: 'middle',
    userSelect: 'none'
  },
  inlineCode: {
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    color: '#e4e4e7',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '12.5px',
    margin: '0 2px'
  },
  codeBlockWrapper: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    overflow: 'hidden',
    margin: '6px 0',
    width: '100%',
    boxSizing: 'border-box'
  },
  codeBlockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#202023',
    borderBottom: '1px solid #27272a'
  },
  codeBlockLang: {
    fontSize: '12px',
    color: '#a1a1aa',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontWeight: 500
  },
  codeBlockActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  codeBlockActionBtn: {
    background: 'none',
    border: 'none',
    color: '#a1a1aa',
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 150ms ease'
  },
  codePre: {
    margin: 0,
    padding: '12px 16px',
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '12.5px',
    lineHeight: '1.6',
    color: '#e4e4e7',
    overflowX: 'auto',
    backgroundColor: '#18181b'
  }
};
