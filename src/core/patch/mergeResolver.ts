import * as fs from 'fs';

export class MergeResolver {
  /**
   * Checks if current file content differs from patch expected state.
   */
  public hasConflict(filePath: string, oldContent?: string): boolean {
    if (!fs.existsSync(filePath)) {
      return oldContent !== undefined && oldContent !== '';
    }
    const currentContent = fs.readFileSync(filePath, 'utf8');
    return oldContent !== undefined && currentContent !== oldContent;
  }
}

export const mergeResolver = new MergeResolver();
