export class RecoveryProvider {
  getRecoveryPlan(inputContext: any) {
    return inputContext?.recoveryPlan || { planId: 'REC-DEFAULT', maxRetries: 3 };
  }
}
export const recoveryProvider = new RecoveryProvider();
