import { IRuntimeValidationProvider, RuntimeValidationContext, RuntimeValidationResult } from './runtimeTypes';

export class RuntimeCompatibility implements IRuntimeValidationProvider {
  public readonly id = 'runtime-compatibility';
  public readonly name = 'Runtime Compatibility Auditor';
  public readonly targetSubsystem = 'Runtime';

  public async validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
    
    if (majorVersion < 16) {
      score -= 30;
      errors.push(`Compatible Node Version check failed: Current Node version is ${nodeVersion}. Kairo-AI requires Node v16+.`);
    }

    score = Math.max(0, score);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: `Audited runtime version compatibility. Platform Node: ${nodeVersion}. OS: ${process.platform}.`,
      errors,
      warnings,
      metrics: {
        nodeVersionMajor: majorVersion,
        platformCompatibilityScore: score
      }
    };
  }
}

export const runtimeCompatibility = new RuntimeCompatibility();
export default runtimeCompatibility;
