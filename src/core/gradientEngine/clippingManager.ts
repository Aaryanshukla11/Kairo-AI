import { TensorGradientModel, ClippingPolicyConfig } from './gradientTypes';

export class ClippingManager {
  public applyClipping(
    layers: TensorGradientModel[],
    policy: ClippingPolicyConfig
  ): { clippedCount: number; maxNormClipped: number } {
    let clippedCount = 0;
    let maxNormClipped = 0;

    if (policy.type === 'None') {
      return { clippedCount, maxNormClipped };
    }

    layers.forEach(l => {
      if (policy.type === 'Value') {
        const limit = policy.threshold;
        let modified = false;

        l.values = l.values.map(v => {
          if (v > limit) {
            clippedCount++;
            modified = true;
            return limit;
          }
          if (v < -limit) {
            clippedCount++;
            modified = true;
            return -limit;
          }
          return v;
        });

        if (modified) {
          // Re-calculate mock norms
          l.gradNorm = parseFloat(
            Math.sqrt(l.values.reduce((sum, val) => sum + val * val, 0)).toFixed(4)
          );
        }
      } else if (policy.type === 'Norm' || policy.type === 'Adaptive') {
        const maxNorm = policy.threshold;
        if (l.gradNorm > maxNorm) {
          clippedCount++;
          const scale = maxNorm / l.gradNorm;
          l.values = l.values.map(v => parseFloat((v * scale).toFixed(4)));
          maxNormClipped = Math.max(maxNormClipped, l.gradNorm);
          l.gradNorm = maxNorm;
        }
      }
    });

    return {
      clippedCount,
      maxNormClipped
    };
  }
}

export const clippingManager = new ClippingManager();
export default clippingManager;
