import { ExperimentModel } from './experimentTypes';

export class ExperimentRunner {
  public mockExecuteRun(experiment: ExperimentModel): ExperimentModel {
    // Simulates a mock execution run step update
    return {
      ...experiment,
      status: 'completed'
    };
  }
}

export const experimentRunner = new ExperimentRunner();
export default experimentRunner;
