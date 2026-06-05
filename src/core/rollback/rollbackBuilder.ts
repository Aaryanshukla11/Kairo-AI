import { randomUUID } from 'crypto';
import { RollbackInfo, RollbackStatus } from './rollbackTypes';
import { Patch } from '../patch/patchTypes';

export class RollbackBuilder {
  /**
   * Compiles RollbackInfo using applied patch details.
   */
  public build(patch: Patch): RollbackInfo {
    const previousState: Record<string, string> = {};
    if (patch.oldContent !== undefined) {
      previousState[patch.filePath] = patch.oldContent;
    }

    return {
      id: randomUUID(),
      patchId: patch.id,
      operationId: patch.operationId,
      affectedFiles: [patch.filePath],
      previousState,
      rollbackPlan: `Revert changes applied by patch "${patch.id}" in file "${patch.filePath}"`,
      status: RollbackStatus.Pending,
      createdAt: Date.now()
    };
  }
}

export const rollbackBuilder = new RollbackBuilder();
