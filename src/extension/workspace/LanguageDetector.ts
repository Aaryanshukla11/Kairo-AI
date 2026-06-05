export class LanguageDetector {
  private static readonly EXTENSION_MAP: Record<string, string> = {
    '.html': 'HTML',
    '.htm': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'SCSS',
    '.js': 'JS',
    '.jsx': 'JS',
    '.mjs': 'JS',
    '.cjs': 'JS',
    '.ts': 'TS',
    '.tsx': 'TS',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.yaml': 'YAML',
    '.yml': 'YAML',
    '.xml': 'XML',
    '.txt': 'TXT'
  };

  /**
   * Maps a file extension to a known language string.
   */
  public static detectLanguage(fileName: string): string {
    const extMatch = fileName.match(/\.[0-9a-z]+$/i);
    if (!extMatch) return 'Unknown';
    
    const ext = extMatch[0].toLowerCase();
    return this.EXTENSION_MAP[ext] || 'Unknown';
  }
}
