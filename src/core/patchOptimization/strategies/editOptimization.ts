export class EditOptimization {
  public name = 'EditOptimizationStrategy';
  public apply(): boolean {
    return true;
  }
}

export const editOptimization = new EditOptimization();
