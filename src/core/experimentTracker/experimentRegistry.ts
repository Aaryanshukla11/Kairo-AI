import { ExperimentModel } from './experimentTypes';

export class ExperimentRegistry {
  private experiments = new Map<string, ExperimentModel>();

  public register(experiment: ExperimentModel): void {
    const key = experiment.experimentId;
    
    // Immutability Check
    if (this.experiments.has(key)) {
      throw new Error(`Versioning Error: Experiment ${experiment.experimentId} already registered and is immutable.`);
    }

    this.experiments.set(key, { ...experiment });
  }

  public get(experimentId: string): ExperimentModel | undefined {
    return this.experiments.get(experimentId);
  }

  public list(): ExperimentModel[] {
    return Array.from(this.experiments.values());
  }

  public clear(): void {
    this.experiments.clear();
  }
}

export const experimentRegistry = new ExperimentRegistry();
export default experimentRegistry;
