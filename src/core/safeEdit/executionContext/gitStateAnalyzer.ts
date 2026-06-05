export class GitStateAnalyzer {
  public getCurrentBranch(): string {
    return 'main';
  }
  public getGitStatus(): string {
    return 'clean';
  }
  public getUncommittedChangesCount(): number {
    return 0;
  }
}
export const gitStateAnalyzer = new GitStateAnalyzer();
