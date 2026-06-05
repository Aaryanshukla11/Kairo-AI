import { virtualFilesystem } from '../../virtualWorkspace/virtualFilesystem';

export class WorkspaceSimulator {
  public simulateWorkspaceState(): string {
    return 'virtual-workspace-state';
  }
}
export const workspaceSimulator = new WorkspaceSimulator();
