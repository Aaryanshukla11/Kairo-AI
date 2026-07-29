export class PlannerMemory {
  private history: any[] = [];

  public rememberPlan(plan: any): void {
    this.history.push(plan);
  }

  public getHistory(): any[] {
    return this.history;
  }

  public clear(): void {
    this.history = [];
  }
}

export const plannerMemory = new PlannerMemory();
