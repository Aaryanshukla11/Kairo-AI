import { DependencyResolutionInput, DependencyResolutionReport } from './dependencyTypes';
import { dependencyEvents } from './dependencyEvents';
import { dependencyMetrics } from './dependencyMetrics';
import { dependencyCache } from './dependencyCache';
import { dependencyAnalyzer } from './dependencyAnalyzer';
import { dependencyResolver } from './dependencyResolver';
import { dependencyGraphManager } from './dependencyGraph';
import { dependencyValidator } from './dependencyValidator';
import { dependencyOptimizer } from './dependencyOptimizer';

export class DependencyResolutionEngine {
  public async resolve(input: DependencyResolutionInput): Promise<DependencyResolutionReport> {
    const startTime = Date.now();
    dependencyEvents.emit('ResolutionStarted', { timestamp: startTime });

    // Step 1: Cache Check (using planId if available)
    const cacheKey = input.featurePlan?.planId || 'default-workspace';
    const cachedGraph = dependencyCache.get(cacheKey);

    let graph = cachedGraph;
    if (!graph) {
      // Step 2: Collect Raw Nodes & Edges from Providers
      const raw = dependencyAnalyzer.collectRawDependencies(input);
      dependencyEvents.emit('DiscoveryCompleted', { nodeCount: raw.nodes.length, edgeCount: raw.edges.length });

      // Step 3: Resolve & Assemble final Graph
      graph = dependencyResolver.resolveGraph(raw.nodes, raw.edges);
      dependencyCache.set(cacheKey, graph);
    }

    // Step 4: Detect Cycles
    const circularReport = dependencyGraphManager.detectCycles(graph);
    dependencyEvents.emit('CyclesChecked', { hasCycles: circularReport.hasCycles });

    // Step 5: Resolve execution ordering
    const executionOrder = dependencyGraphManager.computeTopologicalOrder(graph);

    // Step 6: Optimize
    const suggestions = dependencyOptimizer.optimize(graph);
    dependencyEvents.emit('OptimizationCompleted', { suggestionCount: suggestions.length });

    // Step 7: Validate
    const validationResult = dependencyValidator.validate(graph, circularReport);

    const durationMs = Date.now() - startTime;
    dependencyMetrics.record(
      Object.keys(graph.nodes).length,
      Object.keys(graph.edges).length,
      durationMs,
      circularReport.hasCycles
    );

    const report: DependencyResolutionReport = {
      reportId: `DPR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: Date.now(),
      graph,
      executionOrder,
      circularReport,
      confidence: validationResult.valid ? (circularReport.hasCycles ? 0.4 : 0.95) : 0.2,
      suggestions,
      metrics: {
        nodeCount: Object.keys(graph.nodes).length,
        edgeCount: Object.keys(graph.edges).length,
        resolutionTimeMs: durationMs,
        criticalPathLength: executionOrder.length
      }
    };

    dependencyEvents.emit('ResolutionCompleted', report);
    return report;
  }

  public subscribe(listener: any): () => void {
    return dependencyEvents.subscribe(listener);
  }
}

export const dependencyResolutionEngine = new DependencyResolutionEngine();
