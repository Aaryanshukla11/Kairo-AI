import { MilestoneNode } from './milestoneTypes';

export class MilestoneScheduler {
  scheduleParallelGroups(milestones: MilestoneNode[], executionOrder: string[]): string[][] {
    const nodeMap = new Map<string, MilestoneNode>();
    milestones.forEach(m => nodeMap.set(m.id, m));

    const levelMap = new Map<string, number>();

    for (const id of executionOrder) {
      const node = nodeMap.get(id);
      if (!node || node.dependencies.length === 0) {
        levelMap.set(id, 0);
      } else {
        let maxDepLevel = -1;
        for (const depId of node.dependencies) {
          const depLevel = levelMap.get(depId) ?? 0;
          if (depLevel > maxDepLevel) {
            maxDepLevel = depLevel;
          }
        }
        levelMap.set(id, maxDepLevel + 1);
      }
    }

    const groups: Map<number, string[]> = new Map();
    levelMap.forEach((level, id) => {
      if (!groups.has(level)) {
        groups.set(level, []);
      }
      groups.get(level)!.push(id);
    });

    const result: string[][] = [];
    const sortedLevels = Array.from(groups.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevels) {
      result.push(groups.get(lvl)!);
    }

    return result;
  }

  calculateCriticalPath(milestones: MilestoneNode[]): string[] {
    const nodeMap = new Map<string, MilestoneNode>();
    milestones.forEach(m => nodeMap.set(m.id, m));

    let maxCost = -1;
    let criticalPath: string[] = [];

    const dfs = (currentId: string, currentPath: string[], currentCost: number) => {
      const node = nodeMap.get(currentId);
      if (!node) return;

      const nodeCost = currentCost + node.estimatedRuntime;
      const nextNodes = milestones.filter(m => m.dependencies.includes(currentId));

      if (nextNodes.length === 0) {
        if (nodeCost > maxCost) {
          maxCost = nodeCost;
          criticalPath = [...currentPath, currentId];
        }
        return;
      }

      for (const next of nextNodes) {
        dfs(next.id, [...currentPath, currentId], nodeCost);
      }
    };

    const rootNodes = milestones.filter(m => m.dependencies.length === 0);
    for (const root of rootNodes) {
      dfs(root.id, [], 0);
    }

    return criticalPath.length > 0 ? criticalPath : milestones.map(m => m.id);
  }
}

export const milestoneScheduler = new MilestoneScheduler();
