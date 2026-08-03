import { ReplanTrigger, ImpactAnalysisResult } from './replanningTypes';
import { replanningEvents, ReplanningEventType } from './replanningEvents';

export class ImpactAnalyzer {
  analyzeImpact(trigger: ReplanTrigger, allStages: string[] = ['stg-01', 'stg-02', 'stg-03', 'stg-04', 'stg-05']): ImpactAnalysisResult {
    const triggerIndex = allStages.indexOf(trigger.sourceId);

    let preservedTaskIds: string[] = [];
    let affectedTaskIds: string[] = [];

    if (triggerIndex !== -1) {
      preservedTaskIds = allStages.slice(0, triggerIndex);
      affectedTaskIds = allStages.slice(triggerIndex);
    } else {
      preservedTaskIds = ['stg-01', 'stg-02'];
      affectedTaskIds = [trigger.sourceId, 'stg-04', 'stg-05'];
    }

    const result: ImpactAnalysisResult = {
      triggerId: trigger.id,
      affectedTaskIds,
      affectedMilestoneIds: ['M02', 'M03'],
      preservedTaskIds,
      preservedMilestoneIds: ['M01'],
      riskLevel: affectedTaskIds.length > 2 ? 'Medium' : 'Low'
    };

    replanningEvents.emitEvent(ReplanningEventType.IMPACT_ANALYZED, {
      timestamp: Date.now(),
      trigger,
      impact: result
    });

    return result;
  }
}

export const impactAnalyzer = new ImpactAnalyzer();
