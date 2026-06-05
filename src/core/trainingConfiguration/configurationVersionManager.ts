export class ConfigurationVersionManager {
  private relations = new Map<string, { parent?: string; children: string[] }>();

  public registerRelation(trainingType: string, version: string, parentVersion?: string): void {
    const key = `${trainingType}:${version}`;

    if (parentVersion) {
      const parentKey = `${trainingType}:${parentVersion}`;
      const parentRel = this.relations.get(parentKey) || { children: [] };
      if (!parentRel.children.includes(version)) {
        parentRel.children.push(version);
        this.relations.set(parentKey, parentRel);
      }
    }

    const current = this.relations.get(key) || { children: [] };
    this.relations.set(key, { ...current, parent: parentVersion });
  }

  public getRelation(trainingType: string, version: string) {
    return this.relations.get(`${trainingType}:${version}`);
  }

  public clear(): void {
    this.relations.clear();
  }
}

export const configurationVersionManager = new ConfigurationVersionManager();
export default configurationVersionManager;
