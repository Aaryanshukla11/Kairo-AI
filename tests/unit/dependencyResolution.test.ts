import * as assert from 'assert';
import { dependencyResolutionEngine } from '../../src/core/dependencyResolution/dependencyResolutionEngine';
import { dependencyGraphManager } from '../../src/core/dependencyResolution/dependencyGraph';
import { dependencyValidator } from '../../src/core/dependencyResolution/dependencyValidator';
import { dependencyOptimizer } from '../../src/core/dependencyResolution/dependencyOptimizer';
import { DependencyGraph, DependencyNode, DependencyEdge } from '../../src/core/dependencyResolution/dependencyTypes';

describe('Dependency Resolution Engine Foundation Tests', () => {
  it('should successfully run resolution pipeline and produce a report', async () => {
    const report = await dependencyResolutionEngine.resolve({
      workspaceIndex: { files: ['src/index.ts', 'src/extension/index.ts'] }
    });

    assert.ok(report.reportId.startsWith('DPR-'));
    assert.ok(report.graph);
    assert.ok(report.executionOrder.length > 0);
    assert.strictEqual(report.circularReport.hasCycles, false);
    assert.ok(report.confidence > 0.8);
    assert.ok(report.metrics.nodeCount > 0);
  });

  it('should detect cycles in a circular dependency chain', () => {
    const graph: DependencyGraph = {
      nodes: {
        'file:A': { id: 'file:A', name: 'A', type: 'File' },
        'file:B': { id: 'file:B', name: 'B', type: 'File' },
        'file:C': { id: 'file:C', name: 'C', type: 'File' }
      },
      edges: {
        'e1': { id: 'e1', source: 'file:A', target: 'file:B', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 },
        'e2': { id: 'e2', source: 'file:B', target: 'file:C', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 },
        'e3': { id: 'e3', source: 'file:C', target: 'file:A', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 }
      },
      adjacencyList: {
        'file:A': ['file:B'],
        'file:B': ['file:C'],
        'file:C': ['file:A']
      }
    };

    const cycleReport = dependencyGraphManager.detectCycles(graph);
    assert.strictEqual(cycleReport.hasCycles, true);
    assert.ok(cycleReport.cycles.length > 0);
  });

  it('should compute topological execution order', () => {
    const graph: DependencyGraph = {
      nodes: {
        'file:A': { id: 'file:A', name: 'A', type: 'File' },
        'file:B': { id: 'file:B', name: 'B', type: 'File' },
        'file:C': { id: 'file:C', name: 'C', type: 'File' }
      },
      edges: {
        'e1': { id: 'e1', source: 'file:A', target: 'file:B', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 },
        'e2': { id: 'e2', source: 'file:B', target: 'file:C', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 }
      },
      adjacencyList: {
        'file:A': ['file:B'],
        'file:B': ['file:C'],
        'file:C': []
      }
    };

    const order = dependencyGraphManager.computeTopologicalOrder(graph);
    // Since A depends on B, and B depends on C, C should execute first or be visited before B and A
    assert.deepStrictEqual(order, ['file:A', 'file:B', 'file:C']);
  });

  it('should validate graph and detect broken reference links', () => {
    const graph: DependencyGraph = {
      nodes: {
        'file:A': { id: 'file:A', name: 'A', type: 'File' }
      },
      edges: {
        'e1': { id: 'e1', source: 'file:A', target: 'file:B', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 }
      },
      adjacencyList: {
        'file:A': ['file:B']
      }
    };

    const validation = dependencyValidator.validate(graph, { hasCycles: false, cycles: [] });
    assert.strictEqual(validation.valid, false);
    assert.ok(validation.errors.some(e => e.includes('Broken dependency link')));
  });

  it('should suggest optimizations for redundant and unused dependencies', () => {
    // Redundant edge A -> C when A -> B and B -> C exist
    const graph: DependencyGraph = {
      nodes: {
        'file:A': { id: 'file:A', name: 'A', type: 'File' },
        'file:B': { id: 'file:B', name: 'B', type: 'File' },
        'file:C': { id: 'file:C', name: 'C', type: 'File' },
        'file:D': { id: 'file:D', name: 'D', type: 'File' } // Unused node
      },
      edges: {
        'e1': { id: 'e1', source: 'file:A', target: 'file:B', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 },
        'e2': { id: 'e2', source: 'file:B', target: 'file:C', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 },
        'e3': { id: 'e3', source: 'file:A', target: 'file:C', type: 'File', direction: 'Outgoing', strength: 'Direct', required: true, optional: false, risk: 'Minimal', confidence: 0.9 }
      },
      adjacencyList: {
        'file:A': ['file:B', 'file:C'],
        'file:B': ['file:C'],
        'file:C': [],
        'file:D': []
      }
    };

    const suggestions = dependencyOptimizer.optimize(graph);
    assert.ok(suggestions.length > 0);
    assert.ok(suggestions.some(s => s.type === 'Redundant'));
    assert.ok(suggestions.some(s => s.type === 'Unused'));
  });
});
