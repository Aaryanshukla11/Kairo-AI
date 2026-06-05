import { BaseAstProvider } from './baseAstProvider';
import { ASTNode } from '../astTypes';
import { astBuilder } from '../astBuilder';

export class JavaScriptProvider extends BaseAstProvider {
  public buildAst(ir: any): ASTNode {
    const importNodes = (ir.imports || []).map((imp: any) =>
      astBuilder.buildNode('ImportDeclaration', imp.symbol, imp.source)
    );

    const functionNodes = (ir.functions || []).map((f: any) =>
      astBuilder.buildNode('MethodDeclaration', f.name)
    );

    const classNode = astBuilder.buildNode('ClassDeclaration', ir.className || 'GeneratedJavaScriptClass', undefined, functionNodes);

    return astBuilder.buildNode('Program', undefined, undefined, [...importNodes, classNode]);
  }
}

export const javascriptProvider = new JavaScriptProvider();
