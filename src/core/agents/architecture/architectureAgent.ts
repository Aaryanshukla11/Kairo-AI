import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { ArchitectureBrain } from './architectureBrain';
import { ArchitectureEvents } from './architectureEvents';
import { architectureMetrics } from './architectureMetrics';
import {
  ArchEventType,
  IArchitectureBlueprint,
  IArchitectureAgentLog,
  ArchitectureAgentStage,
  ILayerDefinition,
  IModuleDefinition,
  IDependencyGraph
} from './architectureTypes';
import { IEngineeringDecisionReport } from '../engineeringDecision/engineeringDecisionTypes';

export class ArchitectureAgent extends BaseAgent {
  private events = new ArchitectureEvents();
  public brain: ArchitectureBrain;
  private logs: IArchitectureAgentLog[] = [];
  private logListeners: Array<(log: IArchitectureAgentLog) => void> = [];

  constructor(definition: AgentDefinition) {
    super(definition);
    this.brain = new ArchitectureBrain(this.events);
  }

  public getLogs(): readonly IArchitectureAgentLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: any): () => void {
    if (typeof listener === 'function') {
      this.logListeners.push(listener);
    }
    const unsubEvents = this.events.subscribe(listener);
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
      unsubEvents();
    };
  }

  private emitLog(stageLog: IArchitectureAgentLog): void {
    this.logs.push(stageLog);
    for (const listener of this.logListeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[ArchitectureAgent] Error in log listener:', err);
      }
    }
  }

  public async executeTask(task: AgentTask): Promise<any> {
    this.status = AgentStatus.Running;
    const action = task.payload?.action;

    // Legacy action handling compatibility
    if (action === 'ANALYZE_ARCHITECTURE') {
      try {
        const report = await this.brain.runArchitectureAnalysis(task.payload.filesMap || {});
        this.status = AgentStatus.Completed;
        return { success: true, result: { report }, metrics: architectureMetrics.getMetrics() };
      } catch (err: any) {
        this.events.emit(ArchEventType.ArchitectureAnalysisCompleted, { error: err.message });
        this.status = AgentStatus.Failed;
        throw err;
      }
    } else if (action === 'GET_STATS') {
      this.status = AgentStatus.Completed;
      return { success: true, result: { metrics: architectureMetrics.getMetrics() }, metrics: architectureMetrics.getMetrics() };
    }

    // Default Architecture Blueprint Generation pipeline
    const startTime = Date.now();
    const payload = task.payload || {};
    const decReport: IEngineeringDecisionReport | undefined = payload.engineeringDecisionReport || payload.decisionResult?.report;

    const requestId = decReport?.requestId || payload.requestId || task.id;
    const sessionId = decReport?.sessionId || payload.sessionId || `session-${Date.now()}`;
    const pattern = decReport?.selectedArchitecture || 'Component-Driven Layered Architecture';

    // STAGE 1: ARCHITECTURE GENERATION STARTED
    this.emitLog({
      stage: 'ARCHITECTURE_GENERATION_STARTED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Architecture Blueprint generation started for pattern '${pattern}'`,
      details: { requestId, sessionId, pattern }
    });

    // STAGE 2: LAYER DESIGN
    const layerDiagram = this.designLayers(pattern);
    this.emitLog({
      stage: 'LAYER_DESIGN',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Formulated ${layerDiagram.length} architecture layers`,
      details: {
        requestId,
        sessionId,
        layers: layerDiagram.map(l => l.name)
      }
    });

    // STAGE 3: MODULE DESIGN
    const moduleDiagram = this.designModules(layerDiagram, decReport);
    this.emitLog({
      stage: 'MODULE_DESIGN',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Defined ${moduleDiagram.length} system module boundaries`,
      details: {
        requestId,
        sessionId,
        modules: moduleDiagram.map(m => m.name)
      }
    });

    // STAGE 4: DEPENDENCY ANALYSIS
    const dependencyGraph = this.buildAndAnalyzeDependencyGraph(layerDiagram, moduleDiagram);
    this.emitLog({
      stage: 'DEPENDENCY_ANALYSIS',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Analyzed dependency graph (${dependencyGraph.nodes.length} nodes, ${dependencyGraph.edges.length} edges)`,
      details: {
        requestId,
        sessionId,
        nodesCount: dependencyGraph.nodes.length,
        edgesCount: dependencyGraph.edges.length,
        hasCircularDependencies: dependencyGraph.hasCircularDependencies
      }
    });

    // STAGE 5: ARCHITECTURE VALIDATION
    const isValid = !dependencyGraph.hasCircularDependencies;
    const validationErrors: string[] = [];
    if (!isValid) validationErrors.push('Circular dependency detected in architecture graph');

    this.emitLog({
      stage: 'ARCHITECTURE_VALIDATION',
      timestamp: Date.now(),
      status: isValid ? 'SUCCESS' : 'FAILED',
      message: isValid ? 'Architecture validation completed cleanly with zero circular dependencies' : 'Architecture validation failed',
      details: {
        requestId,
        sessionId,
        validationStatus: isValid ? 'PASSED' : 'FAILED',
        errors: validationErrors
      }
    });

    // STAGE 6: BLUEPRINT GENERATED
    const packageLayout = ['@app/common', '@app/core', '@app/features', '@app/services'];
    const folderLayout = this.designFolderLayout(pattern, decReport);
    const communicationRules = [
      'Presentation layer must interact with Domain layer exclusively via services',
      'Data Access layer must implement interfaces defined in Domain layer (Dependency Inversion)',
      'Cross-cutting concerns must be provided by Shared Common utilities'
    ];
    const sharedLibraries = ['@app/common/utils', '@app/common/types', '@app/common/ui'];
    const designPrinciples = [
      'Single Responsibility Principle (SRP)',
      'Open/Closed Principle (OCP)',
      'Dependency Inversion Principle (DIP)',
      'Clean Architecture Separation'
    ];

    const blueprint: IArchitectureBlueprint = {
      requestId,
      sessionId,
      selectedArchitecturePattern: pattern,
      layerDiagram: Object.freeze(layerDiagram),
      moduleDiagram: Object.freeze(moduleDiagram),
      packageLayout: Object.freeze(packageLayout),
      folderLayout: Object.freeze(folderLayout),
      dependencyGraph: Object.freeze(dependencyGraph),
      communicationRules: Object.freeze(communicationRules),
      sharedLibraries: Object.freeze(sharedLibraries),
      designPrinciples: Object.freeze(designPrinciples),
      validationStatus: isValid ? 'PASSED' : 'FAILED',
      validationErrors: isValid ? undefined : Object.freeze(validationErrors),
      metadata: Object.freeze({
        timestamp: Date.now(),
        version: '1.0.0'
      })
    };

    this.emitLog({
      stage: 'BLUEPRINT_GENERATED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Complete Architecture Blueprint generated`,
      details: {
        requestId,
        sessionId,
        pattern,
        validationStatus: blueprint.validationStatus
      }
    });

    // STAGE 7: BLUEPRINT RETURNED
    this.emitLog({
      stage: 'BLUEPRINT_RETURNED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Returning Architecture Blueprint to Agent Manager`,
      details: {
        requestId,
        sessionId,
        executionTimeMs: Date.now() - startTime
      }
    });

    this.status = isValid ? AgentStatus.Completed : AgentStatus.Failed;

    return {
      success: isValid,
      blueprint,
      metrics: architectureMetrics.getMetrics()
    };
  }

  private designLayers(pattern: string): ILayerDefinition[] {
    return [
      {
        name: 'PresentationLayer',
        responsibility: 'UI components, views, page routing, user interaction handlers',
        allowedDependencies: ['DomainLayer', 'SharedCommon']
      },
      {
        name: 'DomainLayer',
        responsibility: 'Core business entities, domain services, interface abstractions',
        allowedDependencies: ['SharedCommon']
      },
      {
        name: 'DataAccessLayer',
        responsibility: 'Database persistence, API communication clients, external integrations',
        allowedDependencies: ['DomainLayer', 'SharedCommon']
      },
      {
        name: 'SharedCommon',
        responsibility: 'Utility helpers, cross-cutting constants, logger, error handlers',
        allowedDependencies: []
      }
    ];
  }

  private designModules(layers: ILayerDefinition[], decReport?: IEngineeringDecisionReport): IModuleDefinition[] {
    return [
      {
        name: 'UIComponentModule',
        layer: 'PresentationLayer',
        capabilities: ['rendering', 'user_interaction'],
        dependencies: ['BusinessServiceModule', 'SharedUtilModule']
      },
      {
        name: 'BusinessServiceModule',
        layer: 'DomainLayer',
        capabilities: ['business_logic', 'validation'],
        dependencies: ['DataAccessModule', 'SharedUtilModule']
      },
      {
        name: 'DataAccessModule',
        layer: 'DataAccessLayer',
        capabilities: ['persistence', 'querying'],
        dependencies: ['SharedUtilModule']
      },
      {
        name: 'SharedUtilModule',
        layer: 'SharedCommon',
        capabilities: ['logging', 'formatting', 'types'],
        dependencies: []
      }
    ];
  }

  private buildAndAnalyzeDependencyGraph(layers: ILayerDefinition[], modules: IModuleDefinition[]): IDependencyGraph {
    const nodes = modules.map(m => ({ id: m.name, name: m.name, layer: m.layer }));
    const edges: { from: string; to: string }[] = [];

    for (const mod of modules) {
      for (const dep of mod.dependencies) {
        edges.push({ from: mod.name, to: dep });
      }
    }

    const hasCircularDependencies = this.detectCycles(nodes.map(n => n.id), edges);

    return {
      nodes: Object.freeze(nodes),
      edges: Object.freeze(edges),
      hasCircularDependencies
    };
  }

  private detectCycles(nodeIds: string[], edges: { from: string; to: string }[]): boolean {
    const adjMap = new Map<string, string[]>();
    for (const id of nodeIds) adjMap.set(id, []);
    for (const edge of edges) {
      if (adjMap.has(edge.from)) {
        adjMap.get(edge.from)!.push(edge.to);
      }
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = adjMap.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const id of nodeIds) {
      if (!visited.has(id)) {
        if (dfs(id)) return true;
      }
    }

    return false;
  }

  private designFolderLayout(pattern: string, decReport?: IEngineeringDecisionReport): Record<string, any> {
    return {
      src: {
        components: 'UI view elements and components',
        services: 'Domain business logic services',
        data: 'Repositories and data access layer',
        common: 'Shared utilities and types',
        index: 'Main application entry point'
      }
    };
  }
}

