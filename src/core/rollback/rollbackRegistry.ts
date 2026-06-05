import { RollbackInfo } from './rollbackTypes';

export class RollbackRegistry {
  private rollbacks = new Map<string, RollbackInfo>();

  /**
   * Registers a rollback transaction info cache.
   */
  public register(rollback: RollbackInfo): void {
    this.rollbacks.set(rollback.id, rollback);
  }

  /**
   * Retrieves a rollback by id.
   */
  public getById(id: string): RollbackInfo | undefined {
    return this.rollbacks.get(id);
  }

  /**
   * Retrieves a rollback associated with a patchId.
   */
  public getByPatchId(patchId: string): RollbackInfo | undefined {
    return Array.from(this.rollbacks.values()).find(r => r.patchId === patchId);
  }

  /**
   * Returns all registered rollbacks.
   */
  public getAll(): RollbackInfo[] {
    return Array.from(this.rollbacks.values());
  }

  public clear(): void {
    this.rollbacks.clear();
  }
}

export const rollbackRegistry = new RollbackRegistry();
