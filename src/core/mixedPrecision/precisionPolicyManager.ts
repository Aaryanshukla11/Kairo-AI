import { PrecisionPolicy, PrecisionMode } from './precisionTypes';

export class PrecisionPolicyManager {
  private activePolicies: Map<string, PrecisionPolicy> = new Map();

  public getOrCreatePolicy(
    sessionId: string,
    precisionMode: PrecisionMode,
    customOverrides?: Partial<PrecisionPolicy>
  ): PrecisionPolicy {
    const defaultPolicy = this.createDefaultPolicy(precisionMode);
    const existing = this.activePolicies.get(sessionId);

    const mergedPolicy: PrecisionPolicy = {
      ...defaultPolicy,
      ...(existing || {}),
      ...(customOverrides || {}),
      policyId: `policy-${sessionId}-${precisionMode}`
    };

    this.activePolicies.set(sessionId, mergedPolicy);
    return mergedPolicy;
  }

  public getPolicy(sessionId: string): PrecisionPolicy | undefined {
    return this.activePolicies.get(sessionId);
  }

  public updatePolicy(sessionId: string, updates: Partial<PrecisionPolicy>): PrecisionPolicy {
    const current = this.activePolicies.get(sessionId);
    if (!current) {
      throw new Error(`No active precision policy found for training session ${sessionId}`);
    }
    const updated = { ...current, ...updates };
    this.activePolicies.set(sessionId, updated);
    return updated;
  }

  public clearSession(sessionId: string): void {
    this.activePolicies.delete(sessionId);
  }

  public clearAll(): void {
    this.activePolicies.clear();
  }

  private createDefaultPolicy(mode: PrecisionMode): PrecisionPolicy {
    const normMode = mode.toLowerCase();
    switch (normMode) {
      case 'fp16':
        return {
          policyId: '',
          precisionMode: 'fp16',
          lossScalingMode: 'dynamic',
          initialScale: 65536.0,
          minScale: 1.0,
          maxScale: 16777216.0,
          growthFactor: 2.0,
          backoffFactor: 0.5,
          hysteresis: 2000
        };
      case 'bf16':
        return {
          policyId: '',
          precisionMode: 'bf16',
          lossScalingMode: 'automatic',
          initialScale: 1.0,
          minScale: 1.0,
          maxScale: 1.0
        };
      case 'fp32':
      default:
        return {
          policyId: '',
          precisionMode: 'fp32',
          lossScalingMode: 'framework',
          initialScale: 1.0,
          minScale: 1.0,
          maxScale: 1.0
        };
    }
  }
}

export const precisionPolicyManager = new PrecisionPolicyManager();
export default precisionPolicyManager;
