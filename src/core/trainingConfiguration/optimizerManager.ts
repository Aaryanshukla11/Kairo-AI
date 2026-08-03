export class OptimizerManager {
  private allowedOptimizers = ['AdamW', 'SGD', 'Adafactor'];

  public isValid(optimizer: string): boolean {
    return this.allowedOptimizers.includes(optimizer);
  }

  public listAllowed(): string[] {
    return [...this.allowedOptimizers];
  }
}

export const optimizerManager = new OptimizerManager();
export default optimizerManager;
