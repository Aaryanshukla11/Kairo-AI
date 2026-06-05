export class ContextFilters {
  private static readonly IGNORE_LIST = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'tmp',
    'cache',
    '.cache',
    '.vscode-test'
  ]);

  /**
   * Evaluates if a given path or category should be excluded from context.
   */
  public static shouldIgnore(path: string): boolean {
    const segments = path.split(/[/\\]/);
    return segments.some(segment => this.IGNORE_LIST.has(segment));
  }
}
