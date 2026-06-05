export class StructuralOptimization {
  public name = 'StructuralOptimizationStrategy';
  public apply(): boolean {
    return true;
  }
}

export const structuralOptimization = new StructuralOptimization();
