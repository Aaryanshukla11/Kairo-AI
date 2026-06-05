import { ExperimentModel } from './experimentTypes';

export class ExperimentReports {
  public compileReport(experiment: ExperimentModel): string {
    const lines = [
      `# Experiment Summary Report: ${experiment.experimentId}`,
      `Type: ${experiment.experimentType}`,
      `Version: ${experiment.version}`,
      `Status: ${experiment.status}`,
      `Random Seed: ${experiment.randomSeed}`,
      `Created: ${new Date(experiment.creationTime).toLocaleString()}`,
      `\n## Evaluated Metrics:`,
      `Accuracy: ${experiment.metrics.accuracy || 'N/A'}`,
      `Loss: ${experiment.metrics.trainingLoss || 'N/A'}`,
      `Perplexity: ${experiment.metrics.perplexity || 'N/A'}`,
      `Tokens/sec: ${experiment.metrics.throughputTokensPerSec || 'N/A'}`
    ];
    return lines.join('\n');
  }
}

export const experimentReports = new ExperimentReports();
export default experimentReports;
