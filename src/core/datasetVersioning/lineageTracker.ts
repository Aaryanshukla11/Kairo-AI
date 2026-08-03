import { LineageNode } from './versionTypes';

export class LineageTracker {
  private nodes = new Map<string, LineageNode>();

  public registerNode(
    datasetId: string,
    version: string,
    parentVersion?: string,
    derivedFrom?: string,
    pipelineStages: string[] = [],
    transformations: string[] = []
  ): LineageNode {
    const key = `${datasetId}:${version}`;
    
    // Update parent's children list
    if (parentVersion) {
      const parentKey = `${datasetId}:${parentVersion}`;
      const parentNode = this.nodes.get(parentKey);
      if (parentNode) {
        if (!parentNode.children.includes(version)) {
          parentNode.children.push(version);
        }
      }
    }

    const node: LineageNode = {
      version,
      parentVersion,
      children: [],
      derivedFrom,
      pipelineStages,
      transformationHistory: transformations,
      experimentReferences: []
    };

    this.nodes.set(key, node);
    return node;
  }

  public getLineage(datasetId: string, version: string): LineageNode | undefined {
    return this.nodes.get(`${datasetId}:${version}`);
  }

  public getLineageGraph(datasetId: string): LineageNode[] {
    return Array.from(this.nodes.values()).filter(n => {
      // Find nodes registered under datasetId
      const key = Array.from(this.nodes.keys()).find(k => k.startsWith(`${datasetId}:${n.version}`));
      return !!key;
    });
  }

  public clear(): void {
    this.nodes.clear();
  }
}

export const lineageTracker = new LineageTracker();
export default lineageTracker;
