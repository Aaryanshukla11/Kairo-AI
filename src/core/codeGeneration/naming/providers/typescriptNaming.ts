import { NamingProvider } from '../namingRegistry';

export class TypeScriptNaming implements NamingProvider {
  public name = 'TypeScriptNamingRules';

  public isReserved(word: string): boolean {
    return ['any', 'never', 'unknown', 'namespace', 'module', 'type'].includes(word);
  }
}

export const typescriptNaming = new TypeScriptNaming();
