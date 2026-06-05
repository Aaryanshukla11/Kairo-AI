import { RawFileInput } from '../collectorTypes';

export class GitRepositoryProvider {
  public processGitRepo(
    repoUrl: string,
    files: RawFileInput[],
    options?: { branch?: string; commitHash?: string }
  ): RawFileInput[] {
    const repoName = this.extractRepoName(repoUrl);
    const branch = options?.branch || 'main';
    const commitHash = options?.commitHash || 'HEAD';

    return files.map(f => ({
      ...f,
      repository: repoName,
      repositoryUrl: repoUrl,
      branch,
      commitHash
    }));
  }

  public extractRepoName(repoUrl: string): string {
    const parts = repoUrl.replace(/\.git$/, '').split('/');
    return parts.slice(-2).join('/') || repoUrl;
  }
}

export const gitRepositoryProvider = new GitRepositoryProvider();
