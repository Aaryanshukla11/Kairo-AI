import { LossStrategy } from './lossTypes';
import { crossEntropyProvider, focalLossProvider, mseProvider, customLossProvider, mockLossProvider } from './providers';

export class LossSelector {
  public selectStrategy(strategy: LossStrategy): {
    computeLoss: (outputs: number[], targets: number[]) => number;
  } {
    switch (strategy) {
      case 'Cross Entropy':
        return crossEntropyProvider;
      case 'Focal Loss':
        return focalLossProvider;
      case 'Mean Squared Error':
        return mseProvider;
      case 'Custom Loss':
        return customLossProvider;
      default:
        return mockLossProvider;
    }
  }
}

export const lossSelector = new LossSelector();
export default lossSelector;
