export class RollbackGraph {
  public sortRecoveryOrder(files: string[]): string[] {
    // Return files in dependency reverse order (simple reverse array is fine for mocking/simulation)
    return [...files].reverse();
  }
}
export const rollbackGraph = new RollbackGraph();
