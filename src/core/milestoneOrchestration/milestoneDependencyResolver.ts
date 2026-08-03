import { MilestoneNode } from './milestoneTypes';

export class MilestoneDependencyResolver {
  detectCycles(milestones: MilestoneNode[]): { hasCycles: boolean; cycles: string[][] } {
    const nodeMap = new Map<string, MilestoneNode>();
    milestones.forEach(m => nodeMap.set(m.id, m));

    const visited = new Map<string, 'WHITE' | 'GRAY' | 'BLACK'>();
    milestones.forEach(m => visited.set(m.id, 'WHITE'));

    const cycles: string[][] = [];
    const path: string[] = [];

    const dfs = (nodeId: string) => {
      visited.set(nodeId, 'GRAY');
      path.push(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          const color = visited.get(depId);
          if (color === 'GRAY') {
            const cycleStartIndex = path.indexOf(depId);
            cycles.push([...path.slice(cycleStartIndex), depId]);
          } else if (color === 'WHITE') {
            dfs(depId);
          }
        }
      }

      path.pop();
      visited.set(nodeId, 'BLACK');
    };

    for (const m of milestones) {
      if (visited.get(m.id) === 'WHITE') {
        dfs(m.id);
      }
    }

    return {
      hasCycles: cycles.length > 0,
      cycles
    };
  }

  resolveExecutionOrder(milestones: MilestoneNode[]): string[] {
    const { hasCycles, cycles } = this.detectCycles(milestones);
    if (hasCycles) {
      throw new Error(`Circular milestone dependencies detected: ${cycles.map(c => c.join(' ➔ ')).join(' | ')}`);
    }

    const nodeMap = new Map<string, MilestoneNode>();
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    milestones.forEach(m => {
      nodeMap.set(m.id, m);
      inDegree.set(m.id, 0);
      adj.set(m.id, []);
    });

    milestones.forEach(m => {
      for (const depId of m.dependencies) {
        if (adj.has(depId)) {
          adj.get(depId)!.push(m.id);
          inDegree.set(m.id, (inDegree.get(m.id) || 0) + 1);
        }
      }
    });

    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) {
        queue.push(id);
      }
    });

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }
}

export const milestoneDependencyResolver = new MilestoneDependencyResolver();
