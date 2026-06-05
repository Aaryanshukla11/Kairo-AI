import { RetrievalRequest, RetrievedContext } from '../retrieverTypes';
import { ProjectIndex } from '../../indexer/indexTypes';

export class StructuralStrategy {
  /**
   * Discovers matching components using workspace import networks and parent folders.
   */
  public retrieve(request: RetrievalRequest, index: ProjectIndex): RetrievedContext {
    const files = [];
    const dependencies = [];
    const current = request.currentFile;

    if (current) {
      const activeDeps = index.dependencies.filter(d => d.sourceFilePath === current);
      dependencies.push(...activeDeps);

      const targetPaths = new Set(activeDeps.map(d => d.targetFilePath));
      const dependentFiles = index.files.filter(f => targetPaths.has(f.filePath) || f.filePath === current);
      files.push(...dependentFiles);
    }

    return {
      files,
      symbols: [],
      dependencies,
      configs: [],
      documentation: [],
      confidenceScore: files.length > 0 ? 0.8 : 0.5
    };
  }
}
