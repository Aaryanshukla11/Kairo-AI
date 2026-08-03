import { RawFileInput } from '../collectorTypes';

export class GithubArchiveProvider {
  public extractArchiveFiles(archiveUrl: string, rawFiles: RawFileInput[]): RawFileInput[] {
    const archiveName = archiveUrl.split('/').pop() || 'archive.zip';
    return rawFiles.map(f => ({
      ...f,
      repository: archiveName,
      repositoryUrl: archiveUrl
    }));
  }
}

export const githubArchiveProvider = new GithubArchiveProvider();
