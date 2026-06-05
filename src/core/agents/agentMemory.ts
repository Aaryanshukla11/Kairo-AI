export class AgentMemory {
  private memory = new Map<string, any[]>();

  public remember(agentId: string, fact: any): void {
    const history = this.memory.get(agentId) || [];
    history.push(fact);
    this.memory.set(agentId, history);
  }

  public recall(agentId: string): any[] {
    return this.memory.get(agentId) || [];
  }

  public clear(): void {
    this.memory.clear();
  }
}

export const agentMemory = new AgentMemory();
