import { ASTNode } from './astTypes';

export class ASTSerializer {
  public serialize(node: ASTNode): string {
    switch (node.type) {
      case 'Program':
        return (node.children || []).map(c => this.serialize(c)).join('\n');
      case 'ImportDeclaration':
        return `import { ${node.name} } from '${node.value}';`;
      case 'ClassDeclaration':
        return `export class ${node.name} {\n${(node.children || []).map(c => '  ' + this.serialize(c)).join('\n')}\n}`;
      case 'MethodDeclaration':
        return `public ${node.name}() {\n    // Method body\n  }`;
      case 'FunctionDeclaration':
        return `def ${node.name}():\n    pass`;
      default:
        return '';
    }
  }
}

export const astSerializer = new ASTSerializer();
