import { LrScheduleType } from './optimizerTypes';

export class LearningRateManager {
  public calculateLr(
    schedule: LrScheduleType,
    baseLr: number,
    step: number,
    totalSteps: number,
    warmupSteps: number = 0
  ): number {
    if (step <= warmupSteps && warmupSteps > 0) {
      // Linear warmup
      return parseFloat((baseLr * (step / warmupSteps)).toFixed(8));
    }

    const postWarmupStep = step - warmupSteps;
    const postWarmupTotal = Math.max(1, totalSteps - warmupSteps);

    switch (schedule) {
      case 'Constant':
        return baseLr;

      case 'Linear':
        const ratio = 1 - postWarmupStep / postWarmupTotal;
        return parseFloat((baseLr * Math.max(0, ratio)).toFixed(8));

      case 'Cosine':
        const cosRatio = 0.5 * (1 + Math.cos(Math.PI * (postWarmupStep / postWarmupTotal)));
        return parseFloat((baseLr * Math.max(0, cosRatio)).toFixed(8));

      case 'Exponential':
        const decayRate = 0.95;
        return parseFloat((baseLr * Math.pow(decayRate, postWarmupStep / 100)).toFixed(8));

      case 'Step Decay':
        const stepSize = 100;
        const decayFactor = 0.5;
        const stepsCount = Math.floor(postWarmupStep / stepSize);
        return parseFloat((baseLr * Math.pow(decayFactor, stepsCount)).toFixed(8));

      default:
        return baseLr;
    }
  }
}

export const learningRateManager = new LearningRateManager();
export default learningRateManager;
