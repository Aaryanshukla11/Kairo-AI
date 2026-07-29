import { randomUUID } from 'crypto';
import { Patch, ChangeType, PatchStatus } from './patchTypes';
import { generateDiff } from './diffGenerator';

export class PatchBuilder {
  /**
   * Constructs a new Patch model generating diffs dynamically.
   */
  public build(
    operationId: string, 
    filePath: string, 
    changeType: ChangeType, 
    oldContent?: string, 
    newContent?: string, 
    metadata?: Record<string, any>
  ): Patch {
    let diff = '';
    if (changeType === ChangeType.Update && oldContent !== undefined && newContent !== undefined) {
      diff = generateDiff(oldContent, newContent);
    } else if (changeType === ChangeType.Create && newContent !== undefined) {
      diff = newContent.split(/\r?\n/).map(l => `+ ${l}`).join('\n');
    } else if (changeType === ChangeType.Delete && oldContent !== undefined) {
      diff = oldContent.split(/\r?\n/).map(l => `- ${l}`).join('\n');
    }

    return {
      id: randomUUID(),
      operationId,
      filePath,
      changeType,
      oldContent,
      newContent,
      diff,
      status: PatchStatus.Draft,
      createdAt: Date.now(),
      metadata
    };
  }
}

export const patchBuilder = new PatchBuilder();
