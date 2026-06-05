import { randomUUID } from 'crypto';
import { ExecutionGraph, GraphStatus } from './graphTypes';
import { ExecutionNode, NodeStatus } from './node';
import { ExecutionEdge, DependencyType } from './edge';
import { ExecutionPlan } from '../planner/types';

export class GraphBuilder {
  /**
   * Builds an ExecutionGraph from an ExecutionPlan.
   */
  public buildFromPlan(plan: ExecutionPlan): ExecutionGraph {
    const nodes: ExecutionNode[] = plan.tasks.map((task) => {
      let minutes = 5;
      if (task.estimatedTime) {
        const match = task.estimatedTime.match(/^(\d+)/);
        if (match) {
          minutes = parseInt(match[1], 10);
        }
      }

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'TASK',
        status: NodeStatus.Waiting,
        estimatedTime: minutes,
        riskLevel: plan.riskLevel,
        metadata: {
          originalStatus: task.status
        }
      };
    });

    const edges: ExecutionEdge[] = [];
    for (const task of plan.tasks) {
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          edges.push({
            source: depId,
            target: task.id,
            dependencyType: DependencyType.Sequential
          });
        }
      }
    }

    return {
      id: randomUUID(),
      planId: plan.id,
      nodes,
      edges,
      status: GraphStatus.Pending,
      createdAt: Date.now()
    };
  }
}

export const graphBuilder = new GraphBuilder();
