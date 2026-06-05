export class SimulationMetrics {
  private runsCount = 0;
  private failuresCount = 0;

  public record(success: boolean): void {
    this.runsCount++;
    if (!success) this.failuresCount++;
  }

  public getStats(): { runs: number; failures: number } {
    return { runs: this.runsCount, failures: this.failuresCount };
  }
}
export const simulationMetrics = new SimulationMetrics();
