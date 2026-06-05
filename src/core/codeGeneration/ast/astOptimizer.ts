import { ASTNode } from './astTypes';

export class ASTOptimizer {
  public optimize(node: ASTNode): ASTNode {
    // Dead branch pruning: remove children nodes representing empty expressions
    if (node.children) {
      node.children = node.children
        .filter(child => child.type !== 'EmptyStatement')
        .map(child => this.optimize(child));
    }
    return node;
  }
}

export const astOptimizer = new ASTOptimizer();
