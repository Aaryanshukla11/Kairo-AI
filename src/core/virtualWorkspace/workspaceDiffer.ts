import { virtualFilesystem } from './virtualFilesystem';

export class WorkspaceDiffer {
  public diff(originalContent: string, newContent: string): string[] {
    const changes: string[] = [];
    if (originalContent !== newContent) {
      changes.push(`Modified line replacement simulated.`);
    }
    return changes;
  }
}
export const workspaceDiffer = new WorkspaceDiffer();
