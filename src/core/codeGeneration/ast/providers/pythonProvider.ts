import { BaseAstProvider } from './baseAstProvider';
import { ASTNode } from '../astTypes';
import { astBuilder } from '../astBuilder';

export class PythonProvider extends BaseAstProvider {
  public buildAst(ir: any): ASTNode {
    const functionNodes = (ir.functions || []).map((f: any) =>
      astBuilder.buildNode('FunctionDeclaration', f.name)
    );

    return astBuilder.buildNode('Program', undefined, undefined, functionNodes);
  }
}

export const pythonProvider = new PythonProvider();
