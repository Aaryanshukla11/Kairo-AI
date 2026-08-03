import { MilestoneState } from './milestoneTypes';
import { milestoneEvents, MilestoneEventType } from './milestoneEvents';

export class MilestoneStateMachine {
  private allowedTransitions: Record<MilestoneState, MilestoneState[]> = {
    [MilestoneState.Created]: [MilestoneState.Planned, MilestoneState.Cancelled],
    [MilestoneState.Planned]: [MilestoneState.Waiting, MilestoneState.Running, MilestoneState.Cancelled],
    [MilestoneState.Waiting]: [MilestoneState.Running, MilestoneState.Cancelled],
    [MilestoneState.Running]: [MilestoneState.Paused, MilestoneState.Completed, MilestoneState.Failed, MilestoneState.Cancelled],
    [MilestoneState.Paused]: [MilestoneState.Running, MilestoneState.Cancelled],
    [MilestoneState.Completed]: [MilestoneState.RolledBack],
    [MilestoneState.Failed]: [MilestoneState.Recovered, MilestoneState.RolledBack, MilestoneState.Cancelled],
    [MilestoneState.RolledBack]: [MilestoneState.Planned, MilestoneState.Cancelled],
    [MilestoneState.Cancelled]: [],
    [MilestoneState.Recovered]: [MilestoneState.Running, MilestoneState.Completed]
  };

  canTransition(currentState: MilestoneState, targetState: MilestoneState): boolean {
    const allowed = this.allowedTransitions[currentState] || [];
    return allowed.includes(targetState);
  }

  transition(milestoneId: string, currentState: MilestoneState, targetState: MilestoneState): MilestoneState {
    if (!this.canTransition(currentState, targetState)) {
      throw new Error(`Invalid milestone state transition from ${currentState} to ${targetState} for milestone ${milestoneId}`);
    }

    milestoneEvents.emitEvent(MilestoneEventType.MILESTONE_STATE_CHANGED, {
      timestamp: Date.now(),
      milestoneId,
      previousState: currentState,
      newState: targetState
    });

    return targetState;
  }
}

export const milestoneStateMachine = new MilestoneStateMachine();
