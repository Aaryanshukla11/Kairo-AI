import { CheckpointModel, RetentionPolicyConfig } from './checkpointTypes';
import { checkpointRegistry } from './checkpointRegistry';
import { checkpointStorage } from './checkpointStorage';
import { checkpointMetrics } from './checkpointMetrics';

export class CheckpointRetention {
  public applyPolicy(
    policy: RetentionPolicyConfig
  ): string[] {
    const prunedList: string[] = [];
    const list = checkpointRegistry.listCheckpoints();

    if (list.length === 0) return prunedList;

    switch (policy.type) {
      case 'LatestN': {
        const limit = policy.limitN || 5;
        if (list.length > limit) {
          // Sort by creationTimestamp descending (newest first)
          const sorted = [...list].sort((a, b) => b.creationTimestamp - a.creationTimestamp);
          const toPrune = sorted.slice(limit);
          
          toPrune.forEach(c => {
            checkpointRegistry.removeCheckpoint(c.checkpointId);
            checkpointStorage.deleteCheckpoint(c.checkpointId);
            checkpointMetrics.logPrune(c.isCompressed || false);
            prunedList.push(c.checkpointId);
          });
        }
        break;
      }
      case 'BestValidationScore': {
        const limit = policy.limitN || 3;
        if (list.length > limit) {
          // Sort by validationLoss ascending (lowest first = best)
          const sorted = [...list].sort((a, b) => a.evaluationResults.validationLoss - b.evaluationResults.validationLoss);
          const toPrune = sorted.slice(limit);

          toPrune.forEach(c => {
            checkpointRegistry.removeCheckpoint(c.checkpointId);
            checkpointStorage.deleteCheckpoint(c.checkpointId);
            checkpointMetrics.logPrune(c.isCompressed || false);
            prunedList.push(c.checkpointId);
          });
        }
        break;
      }
      case 'BestTrainingLoss': {
        const limit = policy.limitN || 3;
        if (list.length > limit) {
          // Sort by trainingLoss ascending (lowest first = best)
          const sorted = [...list].sort((a, b) => a.evaluationResults.trainingLoss - b.evaluationResults.trainingLoss);
          const toPrune = sorted.slice(limit);

          toPrune.forEach(c => {
            checkpointRegistry.removeCheckpoint(c.checkpointId);
            checkpointStorage.deleteCheckpoint(c.checkpointId);
            checkpointMetrics.logPrune(c.isCompressed || false);
            prunedList.push(c.checkpointId);
          });
        }
        break;
      }
      default:
        // manual or other policy types (no-op or customized)
        break;
    }

    return prunedList;
  }
}

export const checkpointRetention = new CheckpointRetention();
export default checkpointRetention;
