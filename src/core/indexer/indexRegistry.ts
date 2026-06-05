import * as path from 'path';
import { ProjectIndex } from './indexTypes';

export class IndexRegistry {
  private static indexes = new Map<string, ProjectIndex>();

  /**
   * Registers or updates a workspace's project index.
   */
  public static setIndex(workspaceRoot: string, index: ProjectIndex): void {
    const resolvedPath = path.resolve(workspaceRoot).replace(/\\/g, '/').toLowerCase();
    this.indexes.set(resolvedPath, index);
  }

  /**
   * Retrieves a workspace's project index, if registered.
   */
  public static getIndex(workspaceRoot: string): ProjectIndex | null {
    const resolvedPath = path.resolve(workspaceRoot).replace(/\\/g, '/').toLowerCase();
    return this.indexes.get(resolvedPath) || null;
  }

  /**
   * Clears the index registry.
   */
  public static clear(): void {
    this.indexes.clear();
  }
}
