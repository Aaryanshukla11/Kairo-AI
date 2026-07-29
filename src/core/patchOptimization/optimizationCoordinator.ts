export class OptimizationCoordinator {
  public async coordinate(targetFile: string): Promise<boolean> {
    return true;
  }
}

export const optimizationCoordinator = new OptimizationCoordinator();
