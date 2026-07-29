import { graphBuilder } from './graphBuilder';
import { graphValidator } from './graphValidator';
import { graphRegistry } from './graphRegistry';
import { executionOrderGenerator } from './executionOrder';
import { ExecutionGraph } from './graphTypes';
import { ExecutionNode, NodeStatus } from './node';
import { ExecutionPlan } from '../planner/types';

export interface RollbackInfo {
  graphId: string;
  rollbackNodes: {
    nodeId: string;
    originalStatus: NodeStatus;
    title: string;
  }[];
}

export class GraphEngine {
  /**
   * Generates, validates, and registers a dependency execution graph from an approved plan.
   */
  public generateGraph(plan: ExecutionPlan): ExecutionGraph {
    const graph = graphBuilder.buildFromPlan(plan);
    graphValidator.validate(graph);
    graphRegistry.register(graph);
    return graph;
  }

  /**
   * Generates the topological execution sequence for the graph.
   */
  public getExecutionOrder(graph: ExecutionGraph): ExecutionNode[] {
    return executionOrderGenerator.generateOrder(graph);
  }

  /**
   * Prepares rollback metadata to reset executed steps back to original statuses in case of failures.
   */
  public prepareRollbackInfo(graph: ExecutionGraph): RollbackInfo {
    return {
      graphId: graph.id,
      rollbackNodes: graph.nodes.map(n => ({
        nodeId: n.id,
        originalStatus: NodeStatus.Waiting,
        title: n.title
      }))
    };
  }
}

export const graphEngine = new GraphEngine();
