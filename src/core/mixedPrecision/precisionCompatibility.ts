import { HardwareProfile } from '../trainingConfiguration/configurationTypes';
import { PrecisionMode, CompatibilityReport } from './precisionTypes';
import { fp32Provider } from './providers/fp32Provider';
import { fp16Provider } from './providers/fp16Provider';
import { bf16Provider } from './providers/bf16Provider';

export class PrecisionCompatibility {
  public validateCompatibility(
    hardwareProfile: HardwareProfile,
    requestedMode: PrecisionMode
  ): CompatibilityReport {
    const supported = (hardwareProfile.precisionSupported || []).map(p => p.toLowerCase());
    const deviceType = (hardwareProfile.deviceType || '').toLowerCase();
    const mode = requestedMode.toLowerCase();

    const issues: string[] = [];
    const warnings: string[] = [];
    let isCompatible = true;

    // Check by mode
    if (mode === 'fp32') {
      // FP32 is always compatible
      isCompatible = fp32Provider.isHardwareCompatible(deviceType, supported);
    } else if (mode === 'fp16') {
      isCompatible = fp16Provider.isHardwareCompatible(deviceType, supported);
      if (!isCompatible) {
        issues.push(`FP16 is not supported on device '${hardwareProfile.deviceType}'. Supported hardware precisions: [${hardwareProfile.precisionSupported.join(', ')}].`);
      }
      if (deviceType === 'cpu') {
        warnings.push('Running FP16 on CPU may lead to software emulation and slower performance.');
      }
    } else if (mode === 'bf16') {
      isCompatible = bf16Provider.isHardwareCompatible(deviceType, supported);
      if (!isCompatible) {
        issues.push(`BF16 is not supported on device '${hardwareProfile.deviceType}'. Supported hardware precisions: [${hardwareProfile.precisionSupported.join(', ')}].`);
      }
    } else if (mode === 'automatic') {
      // Automatic is always compatible since it selects the best available
      isCompatible = true;
    } else {
      // Future or custom precision types
      const matchesSupported = supported.includes(mode);
      if (!matchesSupported) {
        isCompatible = false;
        issues.push(`Custom precision mode '${requestedMode}' is not registered or supported by hardware. Supported: [${hardwareProfile.precisionSupported.join(', ')}].`);
      }
    }

    return {
      isCompatible,
      precisionMode: requestedMode,
      deviceType: hardwareProfile.deviceType,
      supportedPrecisions: hardwareProfile.precisionSupported,
      issues,
      warnings
    };
  }
}

export const precisionCompatibility = new PrecisionCompatibility();
export default precisionCompatibility;
