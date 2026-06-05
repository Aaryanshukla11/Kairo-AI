export class ConfigurationMetrics {
  private totalBuilt = 0;

  public logBuild(): void {
    this.totalBuilt++;
  }

  public getSummary() {
    return {
      totalConfigurationsBuilt: this.totalBuilt
    };
  }

  public clear(): void {
    this.totalBuilt = 0;
  }
}

export const configurationMetrics = new ConfigurationMetrics();
export default configurationMetrics;
