export class ArchitectureValidator {
  public validateGraphRequest(request: any): void {
    if (!request) {
      throw new Error('Architecture validation error: Missing graph request body');
    }
    if (!request.nodes || !Array.isArray(request.nodes) || request.nodes.length === 0) {
      throw new Error('Architecture validation error: Incomplete graph - nodes list is empty');
    }
    if (!request.edges || !Array.isArray(request.edges)) {
      throw new Error('Architecture validation error: Incomplete graph - edges list is missing');
    }
  }

  public validateMetadata(meta: any): void {
    if (!meta) {
      throw new Error('Architecture validation error: Corrupted architecture metadata');
    }
    if (typeof meta.strictLayers !== 'boolean') {
      throw new Error('Architecture validation error: Missing strictLayers boolean parameter in configuration');
    }
  }

  public validateModuleGraph(nodes: { name: string; layer: string }[]): void {
    const validLayers = ['webview', 'extension', 'core', 'common'];
    for (const node of nodes) {
      if (!validLayers.includes(node.layer)) {
        throw new Error(`Architecture validation error: Invalid module graph - node "${node.name}" specifies unknown layer "${node.layer}"`);
      }
    }
  }
}

export const architectureValidator = new ArchitectureValidator();
