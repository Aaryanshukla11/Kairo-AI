export class TrainingScheduler {
  public calculateLearningRate(
    initialLR: number,
    currentStep: number,
    totalSteps: number,
    schedulerType: 'cosine' | 'linear' | 'constant' | string
  ): number {
    if (schedulerType === 'constant') {
      return initialLR;
    }

    if (schedulerType === 'linear') {
      const ratio = currentStep / Math.max(1, totalSteps);
      return parseFloat((initialLR * (1 - ratio)).toExponential(6));
    }

    // Default cosine decay
    const ratio = currentStep / Math.max(1, totalSteps);
    const cosineDecay = 0.5 * (1 + Math.cos(Math.PI * ratio));
    return parseFloat((initialLR * cosineDecay).toExponential(6));
  }
}

export const trainingScheduler = new TrainingScheduler();
export default trainingScheduler;
