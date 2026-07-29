import { ImportProvider } from '../importRegistry';

export class ReactImports implements ImportProvider {
  public name = 'ReactImportsRules';

  public isCorePackage(pkg: string): boolean {
    return ['react', 'react-dom'].includes(pkg);
  }
}

export const reactImports = new ReactImports();
