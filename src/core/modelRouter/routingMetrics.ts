export class RoutingMetrics {
  private totalRoutes = 0;
  private fallbackCount = 0;

  public logRouting(fallbackTriggered = false): void {
    this.totalRoutes++;
    if (fallbackTriggered) {
      this.fallbackCount++;
    }
  }

  public getStats() {
    return {
      totalRoutes: this.totalRoutes,
      fallbackCount: this.fallbackCount,
      fallbackRate: this.totalRoutes > 0 ? this.fallbackCount / this.totalRoutes : 0.0
    };
  }

  public clear(): void {
    this.totalRoutes = 0;
    this.fallbackCount = 0;
  }
}

export const routingMetrics = new RoutingMetrics();
