export class DependencyValidator {
  public validateManifest(manifest: any): void {
    if (!manifest) {
      throw new Error('Dependency validation error: Missing package manifest (package.json)');
    }
    if (!manifest.dependencies && !manifest.devDependencies) {
      throw new Error('Dependency validation error: Corrupted manifest - dependencies map is missing');
    }
  }

  public validatePackageManager(pm: string): void {
    const supported = ['npm', 'yarn', 'pnpm'];
    if (!supported.includes(pm.toLowerCase())) {
      throw new Error(`Dependency validation error: Unknown package manager "${pm}"`);
    }
  }

  public validateGraph(nodes: any[], edges: any[]): void {
    const nodeNames = new Set(nodes.map(n => n.name));
    for (const edge of edges) {
      if (!nodeNames.has(edge.from) || !nodeNames.has(edge.to)) {
        throw new Error(`Dependency validation error: Broken dependency graph - edge exists referencing undefined node from "${edge.from}" to "${edge.to}"`);
      }
    }
  }
}

export const dependencyValidator = new DependencyValidator();
