import { RawFileInput } from '../collectorTypes';

export class LocalFolderProvider {
  public scanFolder(folderPath: string, rawFiles: RawFileInput[]): RawFileInput[] {
    return rawFiles.filter(f => f.path.startsWith(folderPath) || folderPath === '.' || folderPath === '');
  }

  public discoverFolder(folderPath: string): { path: string; isAccessible: boolean } {
    return {
      path: folderPath,
      isAccessible: true
    };
  }
}

export const localFolderProvider = new LocalFolderProvider();
