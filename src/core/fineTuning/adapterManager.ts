export interface AdapterDetails {
  adapterId: string;
  method: 'lora' | 'qlora';
  rank: number;
  alpha: number;
  targetModules: string[];
  weightsPath: string;
}

export class AdapterManager {
  private activeAdapters: Map<string, AdapterDetails> = new Map();

  public registerAdapter(sessionId: string, details: AdapterDetails): void {
    this.activeAdapters.set(sessionId, details);
  }

  public getAdapter(sessionId: string): AdapterDetails | undefined {
    return this.activeAdapters.get(sessionId);
  }

  public removeAdapter(sessionId: string): void {
    this.activeAdapters.delete(sessionId);
  }

  public clear(): void {
    this.activeAdapters.clear();
  }
}

export const adapterManager = new AdapterManager();
export default adapterManager;
