export class LoadBalancer {
  public balance(queueLength: number): { action: string; batchSize: number } {
    if (queueLength > 5) {
      return { action: 'Enable Dynamic Batching', batchSize: 4 };
    }
    return { action: 'Normal Execution mode', batchSize: 1 };
  }
}

export const loadBalancer = new LoadBalancer();
