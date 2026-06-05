export class CompatibilityValidator {
  public validateStack(
    frontend: string,
    backend: string,
    database: string,
    deployment: string
  ): {
    compatible: boolean;
    conflicts: string[];
  } {
    const conflicts: string[] = [];

    if (frontend === 'Flutter' && backend === 'Next.js') {
      conflicts.push('Flutter frontend conflicts with Next.js backend for native compilation.');
    }

    if (database === 'SQLite' && deployment === 'Docker' && backend === 'Spring Boot') {
      conflicts.push('SQLite file storage conflicts with stateful Docker replica pools.');
    }

    return {
      compatible: conflicts.length === 0,
      conflicts
    };
  }
}

export const compatibilityValidator = new CompatibilityValidator();
export default compatibilityValidator;
