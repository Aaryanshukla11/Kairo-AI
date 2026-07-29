export interface ValidationMetricsData {
  totalValidations: number;
  totalBlockingFailures: number;
}

export class ValidationMetrics {
  private data: ValidationMetricsData = {
    totalValidations: 0,
    totalBlockingFailures: 0
  };

  public record(hasBlocking: boolean): void {
    this.data.totalValidations++;
    if (hasBlocking) {
      this.data.totalBlockingFailures++;
    }
  }

  public getMetrics(): ValidationMetricsData {
    return this.data;
  }
}

export const validationMetrics = new ValidationMetrics();
