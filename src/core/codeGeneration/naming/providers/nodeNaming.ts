import { NamingProvider } from '../namingRegistry';

export class NodeNaming implements NamingProvider {
  public name = 'NodeNamingRules';

  public isReserved(word: string): boolean {
    return ['require', 'exports', 'module', 'process', 'global', 'Buffer'].includes(word);
  }
}

export const nodeNaming = new NodeNaming();
