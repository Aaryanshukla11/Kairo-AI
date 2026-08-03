export class ExperimentArtifacts {
  private activeArtifacts = new Map<string, string[]>();

  public registerArtifacts(experimentId: string, filePaths: string[]): void {
    const list = this.activeArtifacts.get(experimentId) || [];
    filePaths.forEach(path => {
      if (!list.includes(path)) {
        list.push(path);
      }
    });
    this.activeArtifacts.set(experimentId, list);
  }

  public getArtifacts(experimentId: string): string[] {
    return this.activeArtifacts.get(experimentId) || [];
  }

  public clear(): void {
    this.activeArtifacts.clear();
  }
}

export const experimentArtifacts = new ExperimentArtifacts();
export default experimentArtifacts;
