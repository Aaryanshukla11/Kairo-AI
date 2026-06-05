import { virtualFilesystem } from './virtualFilesystem';

export class WorkspaceMerger {
  public merge(filePath: string, patchContent: string): void {
    const current = virtualFilesystem.read(filePath) || '';
    // Simple patch concatenation to mock merging
    const merged = current + '\n' + patchContent;
    virtualFilesystem.write(filePath, merged);
  }
}
export const workspaceMerger = new WorkspaceMerger();
