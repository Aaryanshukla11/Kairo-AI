import { PrecisionMode, LossScalingMode } from '../precisionTypes';

export class BF16Provider {
  public getMode(): PrecisionMode {
    return 'bf16';
  }

  public getDefaultScalingMode(): LossScalingMode {
    return 'automatic';
  }

  public getDefaultInitialScale(): number {
    return 1.0;
  }

  public isHardwareCompatible(deviceType: string, supportedPrecisions: string[]): boolean {
    if (deviceType === 'cpu') {
      return false; // Typically unsupported/extremely slow on standard CPU
    }
    return supportedPrecisions.map(p => p.toLowerCase()).includes('bf16');
  }

  public getRecommendations(): string[] {
    return [
      'BF16 shares the same exponent range as FP32, avoiding underflow issues and eliminating the need for dynamic loss scaling in most setups.',
      'BF16 requires Ampere (RTX 3000 series, A100) or newer GPUs, or TPU platforms.',
      'Highly recommended over FP16 if supported by hardware for its robust numerical stability.'
    ];
  }
}

export const bf16Provider = new BF16Provider();
export default bf16Provider;
