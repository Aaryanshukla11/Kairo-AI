export class VirtualGit {
  public simulateCommit(branch: string, message: string): string {
    return `commit-v-${Math.random().toString(36).substr(2, 9)}`;
  }
}
export const virtualGit = new VirtualGit();
