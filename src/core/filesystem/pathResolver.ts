import * as path from 'path';

export class PathResolver {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  /**
   * Resolves a target path against the workspace root, blocking traversal attacks.
   */
  public resolve(relativeOrAbsolutePath: string): string {
    let resolved: string;
    if (path.isAbsolute(relativeOrAbsolutePath)) {
      resolved = path.resolve(relativeOrAbsolutePath);
    } else {
      resolved = path.resolve(path.join(this.workspaceRoot, relativeOrAbsolutePath));
    }

    // Check if the resolved path starts with the workspace root path
    const relative = path.relative(this.workspaceRoot, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Security violation: Path "${relativeOrAbsolutePath}" lies outside the workspace root`);
    }

    return resolved;
  }

  /**
   * Standardizes paths by normalizing delimiters to forward slashes.
   */
  public normalize(filePath: string): string {
    return filePath.replace(/\\/g, '/');
  }

  public getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
}
