import { ImportProvider } from '../importRegistry';

export class JavaScriptImports implements ImportProvider {
  public name = 'JavaScriptImportsRules';

  public isCorePackage(pkg: string): boolean {
    return ['lodash', 'axios'].includes(pkg);
  }
}

export const javascriptImports = new JavaScriptImports();
