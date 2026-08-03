export class CheckpointVersionManager {
  private lineage = new Map<string, { parentId?: string; childrenIds: string[] }>();

  public registerLineage(checkpointId: string, parentId?: string): void {
    if (parentId) {
      const parent = this.lineage.get(parentId) || { childrenIds: [] };
      if (!parent.childrenIds.includes(checkpointId)) {
        parent.childrenIds.push(checkpointId);
        this.lineage.set(parentId, parent);
      }
    }

    const current = this.lineage.get(checkpointId) || { childrenIds: [] };
    this.lineage.set(checkpointId, { ...current, parentId });
  }

  public getLineage(checkpointId: string) {
    return this.lineage.get(checkpointId);
  }

  public clear(): void {
    this.lineage.clear();
  }
}

export const checkpointVersionManager = new CheckpointVersionManager();
export default checkpointVersionManager;
