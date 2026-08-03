import { RoutingDecisionModel } from './routingTypes';

export class RoutingHistory {
  private history: RoutingDecisionModel[] = [];

  public logDecision(decision: RoutingDecisionModel): void {
    this.history.push(decision);
  }

  public getHistory(): RoutingDecisionModel[] {
    return [...this.history];
  }

  public clear(): void {
    this.history = [];
  }
}

export const routingHistory = new RoutingHistory();
