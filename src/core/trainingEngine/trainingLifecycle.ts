import { TrainingState, TrainingEventType } from './trainingTypes';
import { trainingEvents } from './trainingEvents';

export class TrainingLifecycle {
  private activeState: TrainingState = 'Created';

  public transitionTo(state: TrainingState): void {
    const old = this.activeState;
    this.activeState = state;

    trainingEvents.emit(TrainingEventType.TrainingStateChanged, {
      from: old,
      to: state
    });
  }

  public getState(): TrainingState {
    return this.activeState;
  }

  public clear(): void {
    this.activeState = 'Created';
  }
}

export const trainingLifecycle = new TrainingLifecycle();
export default trainingLifecycle;
