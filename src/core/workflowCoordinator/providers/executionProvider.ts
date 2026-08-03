export class ExecutionProvider {
  getExecutionPlan(inputContext: any) {
    return inputContext?.executionPlan || { planId: 'EXP-DEFAULT', totalSteps: 5 };
  }
}
export const executionProvider = new ExecutionProvider();
