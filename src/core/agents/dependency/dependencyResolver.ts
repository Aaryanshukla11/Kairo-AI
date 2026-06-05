import { DependencyEdge } from './dependencyTypes';

export class DependencyResolver {
  public resolveTransitive(edges: DependencyEdge[]): DependencyEdge[] {
    const output = [...edges];
    
    // Add some mock transitive relationships for common packages
    // (e.g. if vite is registered, add esbuild transitives)
    const hasVite = edges.some(e => e.to === 'vite');
    if (hasVite) {
      output.push({ from: 'vite', to: 'esbuild', type: 'dependency' });
    }

    return output;
  }
}

export const dependencyResolver = new DependencyResolver();
