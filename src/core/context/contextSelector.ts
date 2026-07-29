import { ContextFileInfo } from './contextTypes';

export class ContextSelector {
  /**
   * Selects files to include without exceeding size bounds.
   */
  public selectUnderLimit(files: ContextFileInfo[], limitBytes: number): ContextFileInfo[] {
    const selected: ContextFileInfo[] = [];
    let currentBytes = 0;

    for (const file of files) {
      if (currentBytes + file.size <= limitBytes) {
        selected.push(file);
        currentBytes += file.size;
      }
    }

    return selected;
  }
}

export const contextSelector = new ContextSelector();
