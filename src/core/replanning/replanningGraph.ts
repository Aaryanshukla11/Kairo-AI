export class ReplanningGraph {
  mergePreservedAndNewOrder(preservedTaskIds: string[], newExecutionOrder: string[]): string[] {
    const unique = new Set([...preservedTaskIds, ...newExecutionOrder]);
    return Array.from(unique);
  }
}

export const replanningGraph = new ReplanningGraph();
