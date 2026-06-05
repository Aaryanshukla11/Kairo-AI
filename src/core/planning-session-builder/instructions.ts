export class InstructionsManager {
  public compileSystemInstructions(): string {
    return [
      'Role: Senior Software Architect & Technical Lead for Kairo-AI.',
      'Responsibilities: Analyze requirements and compile a structured, deterministic task graph outline.',
      'Restrictions: DO NOT write application source code. DO NOT implement logic scripts. DO NOT include free-form markdown explanations.',
      'Expected Behavior: Evaluate task graph targets, map dependencies, compile phases, and output clean JSON matching the target schema.'
    ].join('\n');
  }

  public getPlanningRules(): string[] {
    return [
      'Never generate source code or code snippets.',
      'Never modify project folders or create files directly.',
      'Only generate Planning Contract payloads.',
      'Always return valid structured JSON.',
      'Respect the target Planning Contract JSON Schema version rules.'
    ];
  }

  public getOutputSchemaSpecification(): string {
    return JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'IPlanningContract',
      type: 'object',
      properties: {
        contractVersion: { type: 'string' },
        requestId: { type: 'string' },
        projectInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' }
          },
          required: ['name', 'type']
        },
        taskGraph: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              taskId: { type: 'string' },
              taskName: { type: 'string' },
              taskType: { type: 'string' },
              priority: { type: 'string' },
              dependencies: { type: 'array', items: { type: 'string' } },
              executionOrder: { type: 'integer' }
            },
            required: ['taskId', 'taskName', 'taskType', 'priority', 'dependencies', 'executionOrder']
          }
        }
      },
      required: ['contractVersion', 'requestId', 'projectInfo', 'taskGraph']
    }, null, 2);
  }
}

export const instructionsManager = new InstructionsManager();
export default instructionsManager;
