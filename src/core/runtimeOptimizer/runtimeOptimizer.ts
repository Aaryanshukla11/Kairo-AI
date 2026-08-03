import { optimizerEngine } from './optimizerEngine';
import { optimizationHistory } from './optimizationHistory';
import { optimizationEvents } from './optimizationEvents';
import { OptimizationStrategy, OptimizationReport } from './optimizationTypes';

export class RuntimeOptimizer {
  public async optimize(strategy: OptimizationStrategy): Promise<OptimizationReport> {
    return optimizerEngine.executeStrategy(strategy);
  }

  public getHistory(): OptimizationReport[] {
    return optimizationHistory.getHistory();
  }

  public clear(): void {
    optimizationHistory.clear();
  }

  public subscribe(listener: any): () => void {
    return optimizationEvents.subscribe(listener);
  }
}

export const runtimeOptimizer = new RuntimeOptimizer();
