import { ImportProvider } from '../importRegistry';

export class NodeImports implements ImportProvider {
  public name = 'NodeImportsRules';

  public isCorePackage(pkg: string): boolean {
    return ['fs', 'path', 'os', 'child_process'].includes(pkg);
  }
}

export const nodeImports = new NodeImports();
