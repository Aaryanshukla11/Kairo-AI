import { PrecisionMode, LossScalingMode } from '../precisionTypes';

export class AutomaticProvider {
  public getMode(): PrecisionMode {
    return 'automatic';
  }

  public getDefaultScalingMode(): LossScalingMode {
    return 'automatic';
  }

  public getDefaultInitialScale(): number {
    return 1024.0;
  }

  public isHardwareCompatible(_deviceType: string, _supportedPrecisions: string[]): boolean {
    return true;
  }

  public getRecommendations(): string[] {
    return [
      'Automatic mode dynamically selects the highest performing precision compatible with your hardware.',
      'It will prioritize BF16, fallback to FP16 if BF16 is unavailable, and use FP32 as the final safe default.'
    ];
  }
}

export const automaticProvider = new AutomaticProvider();
export default automaticProvider;
