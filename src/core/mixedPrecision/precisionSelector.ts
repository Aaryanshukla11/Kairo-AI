import { HardwareProfile } from '../trainingConfiguration/configurationTypes';
import { PrecisionMode } from './precisionTypes';

export class PrecisionSelector {
  public selectPrecision(
    requestedMode: PrecisionMode,
    hardwareProfile: HardwareProfile
  ): PrecisionMode {
    if (requestedMode.toLowerCase() !== 'automatic') {
      return requestedMode;
    }

    const supported = (hardwareProfile.precisionSupported || []).map(p => p.toLowerCase());
    const deviceType = (hardwareProfile.deviceType || '').toLowerCase();

    if (deviceType === 'cpu') {
      // CPUs usually perform best/most reliably at fp32 or sometimes avx-bf16, but fp32 is the safest default
      return 'fp32';
    }

    if (supported.includes('bf16')) {
      return 'bf16';
    }

    if (supported.includes('fp16')) {
      return 'fp16';
    }

    return 'fp32';
  }
}

export const precisionSelector = new PrecisionSelector();
export default precisionSelector;
