import { FileDependency } from './indexTypes';

export class DependencyIndexer {
  /**
   * Evaluates imports and require statements to build reference connections.
   */
  public indexDependencies(filePath: string, content: string): FileDependency[] {
    const dependencies: FileDependency[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /(?:const|let|var)\s+.*?\s+=\s+require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith('.')) {
        dependencies.push({
          sourceFilePath: filePath,
          targetFilePath: target,
          type: 'Import'
        });
      }
    }

    while ((match = requireRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith('.')) {
        dependencies.push({
          sourceFilePath: filePath,
          targetFilePath: target,
          type: 'Requires'
        });
      }
    }

    return dependencies;
  }
}

export const dependencyIndexer = new DependencyIndexer();
