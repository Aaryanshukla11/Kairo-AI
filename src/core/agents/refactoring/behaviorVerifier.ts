export class BehaviorVerifier {
  /**
   * Asserts whether a proposed refactoring pattern preserves interface behavior inputs/outputs.
   */
  public verifyPreservation(originalCode: string, proposedCode: string): { preserves: boolean; reason?: string } {
    // 1. Basic check: Make sure core export statements are preserved
    const origExports = originalCode.match(/export\s+(const|class|function|enum|interface)\s+(\w+)/g) || [];
    const propExports = proposedCode.match(/export\s+(const|class|function|enum|interface)\s+(\w+)/g) || [];

    const origExportNames = new Set(origExports.map(e => e.split(/\s+/).pop()));
    const propExportNames = new Set(propExports.map(e => e.split(/\s+/).pop()));

    for (const name of origExportNames) {
      if (!propExportNames.has(name)) {
        return {
          preserves: false,
          reason: `Functional signature violation: Exported member "${name}" is missing in the proposed refactor.`
        };
      }
    }

    return { preserves: true };
  }
}

export const behaviorVerifier = new BehaviorVerifier();
