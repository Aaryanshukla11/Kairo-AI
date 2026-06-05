import { optimizationCoordinator } from './optimizationCoordinator';
import { OptimizationStrategy, OptimizationReport } from './optimizationTypes';

export class OptimizerEngine {
  public async executeStrategy(strategy: OptimizationStrategy): Promise<OptimizationReport> {
    return optimizationCoordinator.runOptimize(strategy);
  }
}

export const optimizerEngine = new OptimizerEngine();
