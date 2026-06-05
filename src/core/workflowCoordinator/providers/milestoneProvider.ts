export class MilestoneProvider {
  getMilestoneWorkflow(inputContext: any) {
    return inputContext?.milestoneWorkflow || { workflowId: 'MWF-DEFAULT', milestonesCount: 4 };
  }
}
export const milestoneProvider = new MilestoneProvider();
