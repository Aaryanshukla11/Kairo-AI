import { DatasetFileItem } from '../datasetTypes';

export class GitRepositoryProvider {
  public fetchRepo(url: string): DatasetFileItem[] {
    return [
      { path: 'repo/README.md', content: '# Repository README', sizeBytes: 19, tokenEstimate: 5, language: 'Markdown' }
    ];
  }
}
