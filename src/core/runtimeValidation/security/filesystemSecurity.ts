import * as path from 'path';

export class FilesystemSecurity {
  public auditPath(targetPath: string, workspaceRoot: string): { isSafe: boolean; reason?: string } {
    const resolvedTarget = path.resolve(targetPath);
    const resolvedRoot = path.resolve(workspaceRoot);

    if (!resolvedTarget.startsWith(resolvedRoot)) {
      return {
        isSafe: false,
        reason: `Access Denied: Path '${targetPath}' escapes workspace containment.`
      };
    }
    return { isSafe: true };
  }
}

export const filesystemSecurity = new FilesystemSecurity();
