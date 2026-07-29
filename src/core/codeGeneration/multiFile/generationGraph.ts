export class GenerationGraph {
  private adjList = new Map<string, string[]>();

  public addNode(file: string): void {
    if (!this.adjList.has(file)) {
      this.adjList.set(file, []);
    }
  }

  public addEdge(from: string, to: string): void {
    this.adjList.get(from)?.push(to);
  }

  public getAdjacentNodes(file: string): string[] {
    return this.adjList.get(file) || [];
  }

  public getAllNodes(): string[] {
    return Array.from(this.adjList.keys());
  }
}
