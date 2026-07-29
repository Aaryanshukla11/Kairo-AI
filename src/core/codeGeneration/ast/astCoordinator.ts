import { languageRegistry } from './languageRegistry';
import { astNormalizer } from './astNormalizer';
import { astValidator } from './astValidator';
import { astOptimizer } from './astOptimizer';
import { astSerializer } from './astSerializer';
import { astEvents } from './astEvents';
import { astMetrics } from './astMetrics';
import { ASTArtifact, ASTEventType, ASTNode } from './astTypes';

export class ASTCoordinator {
  public async coordinate(ir: any, language: string): Promise<ASTArtifact> {
    astEvents.emit(ASTEventType.ASTGenerationStarted, { ir, language });

    try {
      const provider = languageRegistry.getProvider(language);
      astEvents.emit(ASTEventType.ProviderSelected, { language });

      const rootNode = provider.buildAst(ir);
      astEvents.emit(ASTEventType.ASTCreated, { rootNode });

      astNormalizer.normalize(rootNode);

      const optimizedRoot = astOptimizer.optimize(rootNode);
      astEvents.emit(ASTEventType.ASTOptimized, { rootNode: optimizedRoot });

      const symbols = (ir.className ? [{ name: ir.className, type: 'class' as const }] : [])
        .concat((ir.functions || []).map((f: any) => ({ name: f.name, type: 'function' as const })))
        .concat((ir.methods || []).map((m: any) => ({ name: m.name, type: 'function' as const })));

      const imports = (ir.imports || []).map((imp: any) => imp.symbol);
      const exports = ir.className ? [ir.className] : [];

      const artifact: ASTArtifact = {
        astId: `ast-${Date.now()}`,
        language: language.toLowerCase() as any,
        rootNode: optimizedRoot,
        symbols,
        imports,
        exports,
        diagnostics: [],
        metadata: {
          nodesCount: this.countNodes(optimizedRoot),
          depth: this.calculateDepth(optimizedRoot),
          optimized: true
        }
      };

      astValidator.validateNode(optimizedRoot);
      astValidator.validateTreeConsistency(artifact);
      astEvents.emit(ASTEventType.ASTValidated, { artifact });

      const serialized = astSerializer.serialize(optimizedRoot);
      astEvents.emit(ASTEventType.ASTSerialized, { serialized });

      astMetrics.record(artifact.metadata.nodesCount, 2);
      astEvents.emit(ASTEventType.GenerationCompleted, { artifact });

      return artifact;
    } catch (err: any) {
      throw err;
    }
  }

  private countNodes(node: ASTNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  private calculateDepth(node: ASTNode): number {
    if (!node.children || node.children.length === 0) {
      return 1;
    }
    let maxChildDepth = 0;
    for (const child of node.children) {
      const childDepth = this.calculateDepth(child);
      if (childDepth > maxChildDepth) {
        maxChildDepth = childDepth;
      }
    }
    return 1 + maxChildDepth;
  }
}

export const astCoordinator = new ASTCoordinator();
