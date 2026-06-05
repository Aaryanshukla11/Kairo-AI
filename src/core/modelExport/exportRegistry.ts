import { UnifiedModelArtifact } from './exportTypes';

export class ExportRegistry {
  private artifacts: Map<string, UnifiedModelArtifact> = new Map();

  public registerArtifact(artifact: UnifiedModelArtifact): void {
    this.artifacts.set(artifact.artifactId, artifact);
  }

  public getArtifact(artifactId: string): UnifiedModelArtifact | undefined {
    return this.artifacts.get(artifactId);
  }

  public listArtifacts(): UnifiedModelArtifact[] {
    return Array.from(this.artifacts.values());
  }

  public clear(): void {
    this.artifacts.clear();
  }
}

export const exportRegistry = new ExportRegistry();
export default exportRegistry;
