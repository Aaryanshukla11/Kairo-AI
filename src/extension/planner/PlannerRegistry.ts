import { Plan } from '../../common/planner';

export class PlannerRegistry {
  private static instance: PlannerRegistry;
  private plans: Map<string, Plan> = new Map();

  private constructor() {}

  public static getInstance(): PlannerRegistry {
    if (!PlannerRegistry.instance) {
      PlannerRegistry.instance = new PlannerRegistry();
    }
    return PlannerRegistry.instance;
  }

  public register(plan: Plan): void {
    if (this.plans.has(plan.id)) {
      throw new Error(`Plan with ID ${plan.id} already exists.`);
    }
    this.plans.set(plan.id, plan);
  }

  public getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
  }

  public getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  public clear(): void {
    this.plans.clear();
  }
}
