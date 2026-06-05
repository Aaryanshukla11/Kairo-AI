import { RuntimeMetricsMap, OptimizationStrategy, OptimizationReport, OptimizationEventType } from './optimizationTypes';
import { resourceMonitor } from './resourceMonitor';
import { optimizationPlanner } from './optimizationPlanner';
import { optimizationExecutor } from './optimizationExecutor';
import { optimizationValidator } from './optimizationValidator';
import { optimizationEvents } from './optimizationEvents';
import { optimizationHistory } from './optimizationHistory';
import { optimizationMetrics } from './optimizationMetrics';

export class OptimizationCoordinator {
  public async runOptimize(strategy: OptimizationStrategy): Promise<OptimizationReport> {
    optimizationEvents.emit(OptimizationEventType.MetricsCollected);
    
    // Collect
    const metricsBefore = resourceMonitor.collectMetrics();

    // Plan
    const decisions = optimizationPlanner.generatePlan(metricsBefore, strategy);
    optimizationEvents.emit(OptimizationEventType.PlanGenerated, { decisions });

    // Execute
    const metricsAfter = optimizationExecutor.execute(metricsBefore, decisions);
    optimizationEvents.emit(OptimizationEventType.OptimizationApplied);

    // Validate
    try {
      optimizationValidator.validate(metricsBefore, metricsAfter);
      optimizationEvents.emit(OptimizationEventType.PlanValidated);
    } catch (err) {
      optimizationEvents.emit(OptimizationEventType.ImprovementsVerified, { error: true });
      throw err;
    }

    const report: OptimizationReport = {
      reportId: `OPT-REP-${Date.now()}`,
      timestamp: Date.now(),
      currentStrategy: strategy,
      metricsBefore,
      metricsAfter,
      decisions,
      healthStatus: 'Healthy'
    };

    optimizationHistory.logReport(report);
    optimizationMetrics.logRun();
    
    optimizationEvents.emit(OptimizationEventType.ImprovementsVerified, { report });
    optimizationEvents.emit(OptimizationEventType.MetricsPublished);

    return report;
  }
}

export const optimizationCoordinator = new OptimizationCoordinator();
