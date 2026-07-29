import { Patch } from './patchTypes';

export class PatchRegistry {
  private patches = new Map<string, Patch>();

  /**
   * Registers a patch inside cache registry.
   */
  public register(patch: Patch): void {
    this.patches.set(patch.id, patch);
  }

  /**
   * Retrieves a patch from registry cache.
   */
  public getById(id: string): Patch | undefined {
    return this.patches.get(id);
  }

  /**
   * Filter patches by operationId.
   */
  public getByOperationId(opId: string): Patch[] {
    return Array.from(this.patches.values()).filter(p => p.operationId === opId);
  }

  /**
   * Returns history of all registered patches.
   */
  public getHistory(): Patch[] {
    return Array.from(this.patches.values());
  }

  public clear(): void {
    this.patches.clear();
  }
}

export const patchRegistry = new PatchRegistry();
