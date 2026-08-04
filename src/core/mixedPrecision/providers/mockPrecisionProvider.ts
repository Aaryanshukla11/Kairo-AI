import { PrecisionMode, LossScalingMode } from '../precisionTypes';

export class MockPrecisionProvider {
  public getMode(): PrecisionMode {
    return 'mock';
  }

  public getDefaultScalingMode(): LossScalingMode {
    return 'static';
  }

  public getDefaultInitialScale(): number {
    return 512.0;
  }

  public isHardwareCompatible(_deviceType: string, _supportedPrecisions: string[]): boolean {
    return true;
  }

  public getRecommendations(): string[] {
    return [
      'Mock precision provider is used exclusively for pipeline testing and verification.',
      'Do not use this provider in real training configurations.'
    ];
  }
}

export const mockPrecisionProvider = new MockPrecisionProvider();
export default mockPrecisionProvider;
