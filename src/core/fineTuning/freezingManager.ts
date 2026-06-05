export class FreezingManager {
  public determineFrozenLayers(
    patterns: string[],
    allModelLayers: string[]
  ): {
    frozenLayers: string[];
    trainableLayers: string[];
  } {
    const frozenLayers: string[] = [];
    const trainableLayers: string[] = [];

    for (const layer of allModelLayers) {
      let matchesPattern = false;
      for (const pattern of patterns) {
        const regexPattern = pattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(layer)) {
          matchesPattern = true;
          break;
        }
      }

      if (matchesPattern) {
        frozenLayers.push(layer);
      } else {
        trainableLayers.push(layer);
      }
    }

    return {
      frozenLayers,
      trainableLayers
    };
  }
}

export const freezingManager = new FreezingManager();
export default freezingManager;
