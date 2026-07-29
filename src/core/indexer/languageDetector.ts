import * as path from 'path';

/**
 * Identifies code languages from file suffixes.
 */
export function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
      return 'TypeScript';
    case '.js':
    case '.cjs':
    case '.mjs':
      return 'JavaScript';
    case '.tsx':
      return 'TSX';
    case '.jsx':
      return 'JSX';
    case '.json':
      return 'JSON';
    case '.md':
    case '.markdown':
      return 'Markdown';
    case '.yaml':
    case '.yml':
      return 'YAML';
    default:
      return 'Unknown';
  }
}
