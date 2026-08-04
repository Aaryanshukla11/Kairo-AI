import { StoppingPolicyConfig } from './stoppingTypes';

export class StoppingPolicyManager {
  private configs: Map<string, StoppingPolicyConfig[]> = new Map();

  public registerPolicies(sessionId: string, policies: StoppingPolicyConfig[]): void {
    this.configs.set(sessionId, policies);
  }

  public getPolicies(sessionId: string): StoppingPolicyConfig[] {
    const list = this.configs.get(sessionId);
    if (list) {
      return list;
    }

    // Default policy: stop if validationLoss fails to improve for 3 steps
    return [
      {
        metric: 'validationLoss',
        patienceWindow: 3,
        mode: 'min',
        minImprovement: 0.001
      }
    ];
  }

  public clearSession(sessionId: string): void {
    this.configs.delete(sessionId);
  }

  public clearAll(): void {
    this.configs.clear();
  }
}

export const stoppingPolicyManager = new StoppingPolicyManager();
export default stoppingPolicyManager;
