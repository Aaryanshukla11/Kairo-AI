export class PlateauDetector {
  public detectPlateau(
    metricHistory: number[],
    threshold: number = 0.005,
    patience: number = 3
  ): {
    isPlateaued: boolean;
    plateauLength: number;
    variance: number;
  } {
    if (metricHistory.length < patience) {
      return { isPlateaued: false, plateauLength: 0, variance: 0 };
    }

    const recent = metricHistory.slice(-patience);
    const maxVal = Math.max(...recent);
    const minVal = Math.min(...recent);
    const range = maxVal - minVal;

    // Calculate variance
    const mean = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const variance = recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length;

    // Plateaued if the range of fluctuations is less than the threshold
    const isPlateaued = range <= threshold;

    let plateauLength = 0;
    if (isPlateaued) {
      plateauLength = patience;
      // Walk back to find full length of plateau
      for (let i = metricHistory.length - patience - 1; i >= 0; i--) {
        if (Math.abs(metricHistory[i] - mean) <= threshold) {
          plateauLength++;
        } else {
          break;
        }
      }
    }

    return {
      isPlateaued,
      plateauLength,
      variance: parseFloat(variance.toFixed(6))
    };
  }
}

export const plateauDetector = new PlateauDetector();
export default plateauDetector;
