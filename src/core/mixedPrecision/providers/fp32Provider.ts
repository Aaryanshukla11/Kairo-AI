import { PrecisionMode, LossScalingMode } from '../precisionTypes';

export class FP32Provider {
  public getMode(): PrecisionMode {
    return 'fp32';
  }

  public getDefaultScalingMode(): LossScalingMode {
    return 'framework';
  }

  public getDefaultInitialScale(): number {
    return 1.0;
  }

  public isHardwareCompatible(_deviceType: string, _supportedPrecisions: string[]): boolean {
    // FP32 is universally supported
    return true;
  }

  public getRecommendations(): string[] {
    return [
      'FP32 provides maximum numerical stability but has higher memory usage and execution time.',
      'Use FP32 if your model experiences NaN gradient overflow under FP16/BF16 and scaling adjustment is not sufficient.'
    ];
  }
}

export const fp32Provider = new FP32Provider();
export default fp32Provider;
