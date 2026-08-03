import { DatasetFileItem } from '../datasetTypes';

export class LocalFolderProvider {
  public readFolder(path: string): DatasetFileItem[] {
    return [
      { path: `${path}/index.ts`, content: 'console.log("local source");', sizeBytes: 28, tokenEstimate: 7, language: 'TypeScript' }
    ];
  }
}
