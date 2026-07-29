import { BaseAstProvider } from './baseAstProvider';
import { ASTNode } from '../astTypes';
import { astBuilder } from '../astBuilder';

export class TypeScriptProvider extends BaseAstProvider {
  public buildAst(ir: any): ASTNode {
    const importNodes = (ir.imports || []).map((imp: any) =>
      astBuilder.buildNode('ImportDeclaration', imp.symbol, imp.source)
    );

    const methodNodes = (ir.methods || []).map((m: any) =>
      astBuilder.buildNode('MethodDeclaration', m.name)
    );

    const classNode = astBuilder.buildNode('ClassDeclaration', ir.className || 'GeneratedTypeScriptClass', undefined, methodNodes);

    return astBuilder.buildNode('Program', undefined, undefined, [...importNodes, classNode]);
  }
}

export const typescriptProvider = new TypeScriptProvider();
