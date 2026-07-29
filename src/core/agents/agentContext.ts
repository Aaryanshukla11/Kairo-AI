export class AgentContext {
  private values = new Map<string, any>();

  public get(key: string): any {
    return this.values.get(key);
  }

  public set(key: string, value: any): void {
    this.values.set(key, value);
  }

  public clear(): void {
    this.values.clear();
  }
}

export const agentContext = new AgentContext();
