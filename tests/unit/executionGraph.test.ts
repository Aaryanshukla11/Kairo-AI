import * as assert from 'assert';
import { plannerEngine } from '../../src/core/planner';
import { graphEngine } from '../../src/core/executionGraph/graphEngine';
import { graphValidator } from '../../src/core/executionGraph/graphValidator';
import { NodeStatus } from '../../src/core/executionGraph/node';
import { DependencyType } from '../../src/core/executionGraph/edge';
import { GraphStatus } from '../../src/core/executionGraph/graphTypes';

describe('Execution Graph Engine Tests', () => {
  it('should successfully build execution graph from planner plan', () => {
    const plan = plannerEngine.generatePlan('Test project prompt');
    const graph = graphEngine.generateGraph(plan);

    assert.ok(graph);
    assert.strictEqual(graph.planId, plan.id);
    assert.strictEqual(graph.nodes.length, plan.tasks.length);
    assert.strictEqual(graph.status, GraphStatus.Pending);
    
    graph.nodes.forEach((node) => {
      assert.ok(node.id);
      assert.ok(node.title);
      assert.strictEqual(node.status, NodeStatus.Waiting);
    });
  });

  it('should generate correct execution order', () => {
    const plan = plannerEngine.generatePlan('Test project prompt');
    const graph = graphEngine.generateGraph(plan);
    const order = graphEngine.getExecutionOrder(graph);

    assert.ok(order);
    assert.strictEqual(order.length, graph.nodes.length);
    
    // Verify topological constraints (task 1 must be before task 2, etc.)
    const task1Index = order.findIndex(n => n.id.includes('-1'));
    const task2Index = order.findIndex(n => n.id.includes('-2'));
    const task3Index = order.findIndex(n => n.id.includes('-3'));
    
    assert.ok(task1Index < task2Index);
    assert.ok(task2Index < task3Index);
  });

  it('should reject duplicate node IDs during validation', () => {
    const badGraph = {
      id: 'graph-1',
      planId: 'plan-1',
      nodes: [
        { id: 'node-1', title: 'Task 1', description: '', type: 'TASK', status: NodeStatus.Waiting, estimatedTime: 1, riskLevel: 'Low' },
        { id: 'node-1', title: 'Task 2', description: '', type: 'TASK', status: NodeStatus.Waiting, estimatedTime: 1, riskLevel: 'Low' }
      ] as any,
      edges: [],
      status: GraphStatus.Pending,
      createdAt: Date.now()
    };

    assert.throws(() => {
      graphValidator.validate(badGraph);
    }, /Duplicate Node ID "node-1"/);
  });

  it('should reject circular dependencies during validation', () => {
    const badGraph = {
      id: 'graph-2',
      planId: 'plan-2',
      nodes: [
        { id: 'node-1', title: 'Task 1', description: '', type: 'TASK', status: NodeStatus.Waiting, estimatedTime: 1, riskLevel: 'Low' },
        { id: 'node-2', title: 'Task 2', description: '', type: 'TASK', status: NodeStatus.Waiting, estimatedTime: 1, riskLevel: 'Low' }
      ] as any,
      edges: [
        { source: 'node-1', target: 'node-2', dependencyType: DependencyType.Sequential },
        { source: 'node-2', target: 'node-1', dependencyType: DependencyType.Sequential }
      ],
      status: GraphStatus.Pending,
      createdAt: Date.now()
    };

    assert.throws(() => {
      graphValidator.validate(badGraph);
    }, /Circular dependencies detected/);
  });

  it('should prepare rollback information correctly', () => {
    const plan = plannerEngine.generatePlan('Test project prompt');
    const graph = graphEngine.generateGraph(plan);
    const rollback = graphEngine.prepareRollbackInfo(graph);

    assert.ok(rollback);
    assert.strictEqual(rollback.graphId, graph.id);
    assert.strictEqual(rollback.rollbackNodes.length, graph.nodes.length);
    rollback.rollbackNodes.forEach((node) => {
      assert.strictEqual(node.originalStatus, NodeStatus.Waiting);
    });
  });
});
