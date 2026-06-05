import { DependencyGraph, CircularDependencyReport } from './dependencyTypes';

export class DependencyValidator {
  public validate(graph: DependencyGraph, circularReport: CircularDependencyReport): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Ensure no circular dependencies
    if (circularReport.hasCycles) {
      for (const cycle of circularReport.cycles) {
        errors.push(`Circular dependency detected: ${cycle.join(' -> ')}`);
      }
    }

    // 2. Ensure no broken references (edges pointing to non-existent nodes)
    const nodeIds = new Set(Object.keys(graph.nodes));
    for (const edgeId of Object.keys(graph.edges)) {
      const edge = graph.edges[edgeId];
      if (!nodeIds.has(edge.source)) {
        errors.push(`Broken dependency link: Source node "${edge.source}" does not exist in graph.`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Broken dependency link: Target node "${edge.target}" does not exist in graph.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const dependencyValidator = new DependencyValidator();
 