import { IgnoreRules } from './IgnoreRules';

export class WorkspaceFilters {
  /**
   * Evaluates if a given file or directory should be scanned.
   */
  public static shouldScan(name: string): boolean {
    return !IgnoreRules.shouldIgnore(name);
  }
}
