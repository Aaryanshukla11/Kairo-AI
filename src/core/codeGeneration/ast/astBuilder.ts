import { ASTNode } from './astTypes';

export class ASTBuilder {
  public buildNode(type: string, name?: string, value?: string, children?: ASTNode[]): ASTNode {
    return {
      type,
      name,
      value,
      children
    };
  }
}

export const astBuilder = new ASTBuilder();
