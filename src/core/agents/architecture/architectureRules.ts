import { ArchGraphEdge, ArchGraphNode, ArchViolation, ArchViolationType } from './architectureTypes';

export class ArchitectureRules {
  public verifyRules(
    nodes: ArchGraphNode[],
    edges: ArchGraphEdge[]
  ): ArchViolation[] {
    const violations: ArchViolation[] = [];
    const layersMap = new Map<string, 'webview' | 'extension' | 'core' | 'common'>();

    for (const n of nodes) {
      layersMap.set(n.name, n.layer);
    }

    for (const edge of edges) {
      const fromLayer = layersMap.get(edge.from);
      const toLayer = layersMap.get(edge.to);

      if (!fromLayer || !toLayer) continue;

      // Rule 1: common cannot import other layers
      if (fromLayer === 'common' && toLayer !== 'common') {
        violations.push({
          type: ArchViolationType.LayerViolation,
          file: edge.from,
          description: `Dependency Inversion violation: Layer "common" imports from "${toLayer}" at target "${edge.to}"`,
          severity: 'High'
        });
      }

      // Rule 2: core cannot import extension
      if (fromLayer === 'core' && toLayer === 'extension') {
        violations.push({
          type: ArchViolationType.LayerViolation,
          file: edge.from,
          description: `Layer violation: Core module imports from extension runtime at target "${edge.to}"`,
          severity: 'High'
        });
      }

      // Rule 3: webview cannot import extension or core
      if (fromLayer === 'webview' && (toLayer === 'extension' || toLayer === 'core')) {
        violations.push({
          type: ArchViolationType.LayerViolation,
          file: edge.from,
          description: `Boundary violation: Webview imports extension/core code directly at target "${edge.to}"`,
          severity: 'High'
        });
      }
    }

    return violations;
  }
}

export const architectureRules = new ArchitectureRules();
