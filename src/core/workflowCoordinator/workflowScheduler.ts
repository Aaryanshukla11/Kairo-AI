import { WorkflowStage } from './workflowTypes';

export class WorkflowScheduler {
  scheduleParallelGroups(stages: WorkflowStage[], executionOrder: string[]): string[][] {
    const stageMap = new Map<string, WorkflowStage>();
    stages.forEach(s => stageMap.set(s.id, s));

    const levelMap = new Map<string, number>();

    for (const id of executionOrder) {
      const stage = stageMap.get(id);
      if (!stage || stage.dependencies.length === 0) {
        levelMap.set(id, 0);
      } else {
        let maxDep = -1;
        for (const depId of stage.dependencies) {
          const lvl = levelMap.get(depId) ?? 0;
          if (lvl > maxDep) maxDep = lvl;
        }
        levelMap.set(id, maxDep + 1);
      }
    }

    const groups = new Map<number, string[]>();
    levelMap.forEach((lvl, id) => {
      if (!groups.has(lvl)) groups.set(lvl, []);
      groups.get(lvl)!.push(id);
    });

    const result: string[][] = [];
    const sortedLevels = Array.from(groups.keys()).sort((a, b) => a - b);
    for (const lvl of sortedLevels) {
      result.push(groups.get(lvl)!);
    }

    return result;
  }
}

export const workflowScheduler = new WorkflowScheduler();
