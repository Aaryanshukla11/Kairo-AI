export class WhitespaceOptimization {
  public name = 'WhitespaceOptimizationStrategy';
  public apply(): boolean {
    return true;
  }
}

export const whitespaceOptimization = new WhitespaceOptimization();
