export class PlannerProvider {
  getFeaturePlan(inputContext: any) {
    return inputContext?.featurePlan || { planId: 'FP-DEFAULT', title: 'Autonomous Workflow Execution' };
  }
}
export const plannerProvider = new PlannerProvider();
