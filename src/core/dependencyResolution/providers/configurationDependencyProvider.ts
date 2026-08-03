import { DependencyNode, DependencyEdge, DependencyResolutionInput } from '../dependencyTypes';

export class ConfigurationDependencyProvider {
  public collect(input: DependencyResolutionInput): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Mock config files
    const configs = ['tsconfig.json', 'package.json', 'vite.config.ts', '.eslintrc.json'];
    
    for (const config of configs) {
      nodes.push({
        id: `config:${config}`,
        name: config,
        type: 'Configuration',
        metadata: { filename: config }
      });
    }

    return { nodes, edges };
  }
}

export const configurationDependencyProvider = new ConfigurationDependencyProvider();
