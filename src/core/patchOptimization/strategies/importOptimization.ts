export class ImportOptimization {
  public name = 'ImportOptimizationStrategy';
  public apply(): boolean {
    return true;
  }
}

export const importOptimization = new ImportOptimization();
