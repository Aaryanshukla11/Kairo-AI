import { NodeModel } from './distributedTypes';

export class NodeManager {
  private nodes = new Map<string, NodeModel>();

  public registerNode(node: NodeModel): void {
    this.nodes.set(node.nodeId, { ...node });
  }

  public getNode(nodeId: string): NodeModel | undefined {
    return this.nodes.get(nodeId);
  }

  public listNodes(): NodeModel[] {
    return Array.from(this.nodes.values());
  }

  public updateNodeHealth(nodeId: string, cpu: number, ram: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.cpuUsagePercent = cpu;
      node.ramUsagePercent = ram;
      node.status = 'online';
      this.nodes.set(nodeId, node);
    }
  }

  public markNodeOffline(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = 'offline';
      this.nodes.set(nodeId, node);
    }
  }

  public clear(): void {
    this.nodes.clear();
  }
}

export const nodeManager = new NodeManager();
export default nodeManager;
