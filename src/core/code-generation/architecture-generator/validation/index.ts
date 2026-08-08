import { IModuleMetadata, IDependencyEdge } from '../schema';

export class ArchitectureValidator {
  public validate(
    modules: IModuleMetadata[],
    edges: IDependencyEdge[],
    cycles: string[]
  ): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    // 1. Check circular dependencies cycles
    if (cycles.length > 0) {
      violations.push(`Circular dependency violation detected: ${cycles.join(' -> ')}`);
    }

    // 2. Validate empty interfaces list
    for (const m of modules) {
      if (m.interfaces.length === 0) {
        violations.push(`Module validation warning: Module '${m.name}' has no defined public service interfaces.`);
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}

export const architectureValidator = new ArchitectureValidator();
export default architectureValidator;
