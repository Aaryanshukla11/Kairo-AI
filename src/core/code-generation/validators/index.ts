import { IGenerator } from '../interfaces';
import { ValidationError } from '../errors';

export class CodeGenValidator {
  public validateRegistry(generators: IGenerator[]): void {
    const ids = new Set<string>();

    for (const gen of generators) {
      // 1. Validate ID duplicates
      if (ids.has(gen.id)) {
        throw new ValidationError(
          `Registry validation error: Duplicate generator ID found: '${gen.id}'.`,
          'CodeGenValidator',
          'Ensure every registered generator implements a globally unique ID string.'
        );
      }
      ids.add(gen.id);

      // 2. Validate missing metadata fields
      if (!gen.name || !gen.version || !gen.description) {
        throw new ValidationError(
          `Registry validation error: Generator '${gen.id}' is missing required metadata properties (name, version, or description).`,
          'CodeGenValidator',
          'Populate all metadata descriptors inside the generator class.'
        );
      }

      // 3. Validate empty framework / language coverage
      if (gen.supportedLanguages.length === 0 || gen.supportedFrameworks.length === 0) {
        throw new ValidationError(
          `Registry validation error: Generator '${gen.id}' must specify at least one supported language and framework.`,
          'CodeGenValidator',
          'Add supported target languages and frameworks arrays properties.'
        );
      }
    }

    // 4. Validate dependency cycles using DFS topological analysis
    this.detectDependencyCycles(generators);
  }

  private detectDependencyCycles(generators: IGenerator[]): void {
    const adj = new Map<string, string[]>();
    const registeredIds = new Set(generators.map(g => g.id));

    for (const g of generators) {
      // Filter out external or missing dependencies to avoid crashes
      const deps = g.dependencies.filter(d => registeredIds.has(d));
      adj.set(g.id, deps);
    }

    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (node: string) => {
      visited.add(node);
      stack.add(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        } else if (stack.has(neighbor)) {
          throw new ValidationError(
            `Registry validation error: Circular dependency detected in execution path: ${Array.from(stack).join(' -> ')} -> ${neighbor}`,
            'CodeGenValidator',
            'Break dependency loops between generator registration references.'
          );
        }
      }
      stack.delete(node);
    };

    for (const g of generators) {
      if (!visited.has(g.id)) {
        dfs(g.id);
      }
    }
  }
}

export const codeGenValidator = new CodeGenValidator();
export default codeGenValidator;
