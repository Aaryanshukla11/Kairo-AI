import { changeDetector } from './changeDetector';
import { impactAnalyzer } from './impactAnalyzer';
import { workflowComparator } from './workflowComparator';
import { conflictResolver } from './conflictResolver';
import { replanningPlanner } from './replanningPlanner';
import { replanningValidator } from './replanningValidator';
import { replanningAnalyzer } from './replanningAnalyzer';
import { ReplanningInput, ReplanningReport } from './replanningTypes';

export class ReplanningCoordinator {
  async processReplanning(input: ReplanningInput = {}): Promise<ReplanningReport> {
    const startTime = Date.now();

    // 1. Detect Change
    const trigger = changeDetector.detectChange(input);

    // 2. Impact Analysis
    const allStages = ['stg-01', 'stg-02', 'stg-03', 'stg-04', 'stg-05'];
    const impact = impactAnalyzer.analyzeImpact(trigger, allStages);

    // 3. Generate Updated Plan
    const { newExecutionOrder, strategy } = replanningPlanner.generateUpdatedPlan(
      impact.preservedTaskIds,
      impact.affectedTaskIds,
      input.strategy
    );

    // 4. Calculate Execution Delta & Conflicts
    const delta = workflowComparator.compareWorkflows(allStages, newExecutionOrder, impact.preservedTaskIds);
    const conflicts = conflictResolver.resolveConflicts(impact.affectedTaskIds);

    // 5. Validate Updated Plan
    const validationResult = replanningValidator.validate(impact.preservedTaskIds, newExecutionOrder);

    // 6. Recovery Suggestions
    const recoverySuggestions = replanningAnalyzer.generateRecoverySuggestions(impact);

    return {
      reportId: `RPL-RPT-${startTime}`,
      timestamp: startTime,
      workflowId: input.workflowId || 'WF-ACTIVE',
      trigger,
      strategy,
      impact,
      delta,
      conflicts,
      updatedExecutionOrder: newExecutionOrder,
      recoverySuggestions,
      confidence: validationResult.valid ? 0.94 : 0.45,
      validationResult
    };
  }
}

export const replanningCoordinator = new ReplanningCoordinator();
