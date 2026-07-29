import { ASTNode, ASTArtifact } from './astTypes';

export class ASTValidator {
  public validateNode(node: ASTNode): void {
    if (!node) {
      throw new Error('AST validation error: Missing tree node');
    }
    if (!node.type) {
      throw new Error('AST validation error: Node is missing type identifier');
    }
  }

  public validateTreeConsistency(artifact: ASTArtifact): void {
    if (!artifact.rootNode) {
      throw new Error('AST validation error: Broken syntax tree - rootNode is missing');
    }
    
    // Check duplicate symbols
    const symbolsNames = artifact.symbols.map(s => s.name);
    const seen = new Set<string>();
    for (const name of symbolsNames) {
      if (seen.has(name)) {
        throw new Error(`AST validation error: Duplicate symbol definition found: "${name}"`);
      }
      seen.add(name);
    }

    // Check invalid imports
    for (const imp of artifact.imports) {
      if (imp.trim() === '') {
        throw new Error('AST validation error: Syntax tree contains empty import statement references');
      }
    }
  }
}

export const astValidator = new ASTValidator();
