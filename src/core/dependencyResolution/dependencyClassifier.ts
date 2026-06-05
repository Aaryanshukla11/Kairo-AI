import { DependencyEdge, DependencyStrength, DependencyRisk } from './dependencyTypes';

export class DependencyClassifier {
  public classifyEdge(edge: DependencyEdge): DependencyEdge {
    let strength: DependencyStrength = 'Direct';
    let risk: DependencyRisk = 'Minimal';

    // Basic heuristic classification rules
    if (edge.optional) {
      strength = 'Optional';
    } else if (edge.type === 'Package' || edge.type === 'Import') {
      strength = 'Peer';
    }

    if (edge.type === 'API' || edge.type === 'Environment') {
      risk = 'Medium';
    } else if (edge.type === 'Database') {
      risk = 'Low';
    }

    return {
      ...edge,
      strength,
      risk
    };
  }
}

export const dependencyClassifier = new DependencyClassifier();
