import { PrecisionMode, LossScalingMode } from '../precisionTypes';

export class FP16Provider {
  public getMode(): PrecisionMode {
    return 'fp16';
  }

  public getDefaultScalingMode(): LossScalingMode {
    return 'dynamic';
  }

  public getDefaultInitialScale(): number {
    return 65536.0;
  }

  public isHardwareCompatible(deviceType: string, supportedPrecisions: string[]): boolean {
    if (deviceType === 'cpu') {
      return false;
    }
    return supportedPrecisions.map(p => p.toLowerCase()).includes('fp16');
  }

  public getRecommendations(): string[] {
    return [
      'FP16 provides double performance speedup and halves memory usage on compatible GPUs.',
      'Always use dynamic loss scaling with FP16 to prevent gradient underflow.',
      'Ensure your hardware has active tensor cores supporting float16 precision.'
    ];
  }
}

export const fp16Provider = new FP16Provider();
export default fp16Provider;
