export class ReplanningScheduler {
  rescheduleStages(executionOrder: string[]): string[][] {
    // Schedule into parallel groups
    const groups: string[][] = [];
    for (let i = 0; i < executionOrder.length; i += 2) {
      groups.push(executionOrder.slice(i, i + 2));
    }
    return groups;
  }
}

export const replanningScheduler = new ReplanningScheduler();
