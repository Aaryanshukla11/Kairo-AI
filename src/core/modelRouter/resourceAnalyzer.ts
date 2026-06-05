export class ResourceAnalyzer {
  public validateResources(
    modelMemoryGb: number,
    availableRamGb: number
  ): { ok: boolean; score: number; reason?: string } {
    if (modelMemoryGb > availableRamGb) {
      return { ok: false, score: 0.0, reason: `Insufficient System RAM: requires ${modelMemoryGb}GB, available is ${availableRamGb}GB` };
    }

    // Score RAM utilization safety margin
    const margin = availableRamGb - modelMemoryGb;
    let score = 0.5;
    if (margin > 8) score = 1.0;
    else if (margin > 4) score = 0.8;

    return { ok: true, score };
  }
}

export const resourceAnalyzer = new ResourceAnalyzer();
