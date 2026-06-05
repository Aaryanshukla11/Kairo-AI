import { ImportProvider } from '../importRegistry';

export class TypeScriptImports implements ImportProvider {
  public name = 'TypeScriptImportsRules';

  public isCorePackage(pkg: string): boolean {
    return ['typescript', 'tslint'].includes(pkg);
  }
}

export const typescriptImports = new TypeScriptImports();
