import { ASTNode } from '../astTypes';

export abstract class BaseAstProvider {
  public abstract buildAst(ir: any): ASTNode;
}
