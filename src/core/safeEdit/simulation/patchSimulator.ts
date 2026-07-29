import { workspaceMerger } from '../../virtualWorkspace/workspaceMerger';

export class PatchSimulator {
  public simulatePatch(targetFile: string, patchContent: string): void {
    workspaceMerger.merge(targetFile, patchContent);
  }
}
export const patchSimulator = new PatchSimulator();
