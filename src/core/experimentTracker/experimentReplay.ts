import { ExperimentModel, ReplayReportModel } from './experimentTypes';

export class ExperimentReplay {
  public generateReplayReport(
    experiment: ExperimentModel,
    currentRandomSeed: number,
    currentHardware: any
  ): ReplayReportModel {
    const mismatches: string[] = [];
    const seedTested = currentRandomSeed;

    if (experiment.randomSeed !== currentRandomSeed) {
      mismatches.push(`Seed Mismatch: Experiment expects seed ${experiment.randomSeed}, tested with ${currentRandomSeed}.`);
    }

    if (experiment.hardwareProfile.deviceType !== currentHardware.deviceType) {
      mismatches.push(`Hardware Mismatch: Experiment expects ${experiment.hardwareProfile.deviceType}, current environment is ${currentHardware.deviceType}.`);
    }

    return {
      isReproducible: mismatches.length === 0,
      experimentId: experiment.experimentId,
      seedTested,
      environmentMatches: mismatches.length === 0,
      mismatches
    };
  }
}

export const experimentReplay = new ExperimentReplay();
export default experimentReplay;
