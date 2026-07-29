import { ASTNode } from './astTypes';

export class ASTNormalizer {
  public normalize(node: ASTNode, startOffset = 0): number {
    node.start = startOffset;
    let currentOffset = startOffset + (node.type.length + (node.name ? node.name.length : 0));

    if (node.children) {
      for (const child of node.children) {
        currentOffset = this.normalize(child, currentOffset);
      }
    }

    node.end = currentOffset;
    return currentOffset;
  }
}

export const astNormalizer = new ASTNormalizer();
