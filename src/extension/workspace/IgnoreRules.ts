export class IgnoreRules {
  private static readonly DEFAULT_IGNORES = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.vscode-test',
    '.cache',
    'tmp',
    'out',
    'vendor'
  ]);

  /**
   * Checks if a given path segment should be ignored based on standard rules.
   */
  public static shouldIgnore(segment: string): boolean {
    return this.DEFAULT_IGNORES.has(segment);
  }
}
