export class CodingInstructionsManager {
  public getSystemRole(): string {
    return 'You are a Senior Software Engineer responsible for generating production-ready software.';
  }

  public getGenerationRules(): string[] {
    return [
      'Never overwrite unrelated files.',
      'Generate production-ready code.',
      'Follow project architecture rules.',
      'Reuse existing code whenever possible.',
      'Respect coding standards.',
      'Generate modular code.',
      'Generate maintainable code.',
      'Never generate placeholder implementations.'
    ];
  }

  public getArchitectureRules(): string[] {
    return [
      'Follow project directory layouts.',
      'Follow project dependency boundaries.',
      'Use only the configured technology stack.',
      'Respect project conventions.',
      'Never violate module encapsulation boundaries.'
    ];
  }

  public getCodingStandards(): { languageConventions: string; namingConventions: string; formattingRules: string } {
    return {
      languageConventions: 'TypeScript target ESNext, absolute paths, clean comments.',
      namingConventions: 'camelCase variables, PascalCase classes, camelCase files, UPPER_SNAKE_CASE constants.',
      formattingRules: 'Prettier aligned, 2 space tabs indentations, no trailing spaces.'
    };
  }

  public getOutputContractSpecification(): string {
    return JSON.stringify({
      title: 'ICodeGenerationResponse',
      type: 'object',
      properties: {
        generatedFiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['path', 'content']
          }
        },
        modifiedFiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['path', 'content']
          }
        },
        createdDirectories: {
          type: 'array',
          items: { type: 'string' }
        },
        warnings: { type: 'array', items: { type: 'string' } },
        errors: { type: 'array', items: { type: 'string' } }
      },
      required: ['generatedFiles', 'modifiedFiles', 'createdDirectories']
    }, null, 2);
  }
}

export const codingInstructionsManager = new CodingInstructionsManager();
export default codingInstructionsManager;
