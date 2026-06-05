import { IRuntimeValidationProvider, RuntimeValidationContext, RuntimeValidationResult } from '../runtimeTypes';
import { reliabilityEngine } from '../reliability/reliabilityEngine';

export class ReliabilityProvider implements IRuntimeValidationProvider {
  public readonly id = 'reliability-provider-wrap';
  public readonly name = 'Reliability Test Provider';
  public readonly targetSubsystem = 'Reliability';

  public async validate(context: RuntimeValidationContext): Promise<RuntimeValidationResult> {
    const result = await reliabilityEngine.executeStabilityTests();
    const score = result.failures.length === 0 ? 100 : Math.max(0, 100 - result.failures.length * 20);
    const status = score >= 90 ? 'Passed' : score >= 60 ? 'Warning' : 'Failed';

    return {
      name: this.name,
      status,
      score,
      details: 'Completed concurrency runs, crash recovery triggers, watchdog timeouts checks and fault injection testing.',
      errors: result.failures,
      warnings: [],
      metrics: {
        crashRecoveryPct: Math.round(result.crashRecoveryRate * 100),
        memoryRecoveryPct: Math.round(result.memoryRecoveryPct),
        watchdogTriggersCount: result.watchdogTriggers
      }
    };
  }
}

export const reliabilityProvider = new ReliabilityProvider();
export default reliabilityProvider;
