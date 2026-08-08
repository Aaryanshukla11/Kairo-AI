import { PlatformHealthReport, ValidationResult } from './validationTypes';
import { healthScore } from './healthScore';

export class ArchitectureHealth {
  private healthReports: PlatformHealthReport[] = [];

  public aggregateHealth(results: Record<string, ValidationResult>): PlatformHealthReport {
    const report = healthScore.calculateHealth(results, this.healthReports);
    this.healthReports.push(report);
    return report;
  }

  public getHistory(): PlatformHealthReport[] {
    return [...this.healthReports];
  }

  public getLatestHealth(): PlatformHealthReport | undefined {
    return this.healthReports[this.healthReports.length - 1];
  }

  public clearHistory(): void {
    this.healthReports = [];
  }
}

export const architectureHealth = new ArchitectureHealth();
