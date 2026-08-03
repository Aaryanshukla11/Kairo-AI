export class TokenizerVersionManager {
  private relations = new Map<string, { parent?: string; children: string[] }>();

  public registerRelation(datasetId: string, version: string, parentVersion?: string): void {
    const key = `${datasetId}:${version}`;
    
    if (parentVersion) {
      const parentKey = `${datasetId}:${parentVersion}`;
      const rel = this.relations.get(parentKey) || { children: [] };
      if (!rel.children.includes(version)) {
        rel.children.push(version);
        this.relations.set(parentKey, rel);
      }
    }

    const current = this.relations.get(key) || { children: [] };
    this.relations.set(key, { ...current, parent: parentVersion });
  }

  public getRelation(datasetId: string, version: string) {
    return this.relations.get(`${datasetId}:${version}`);
  }

  public clear(): void {
    this.relations.clear();
  }
}

export const tokenizerVersionManager = new TokenizerVersionManager();
export default tokenizerVersionManager;
