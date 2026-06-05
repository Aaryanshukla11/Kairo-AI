import { IGenerationContext, IGeneratorRegistry } from '../interfaces';
import { GenerationContext } from '../context';
import { generatorRegistry } from '../registry';
import { pipelineEngine, PipelineStage } from '../pipeline';
import { codeGenValidator } from '../validators';
import { reportGenerator, GenerationReport } from '../reports';
import { logger } from '../logger';

export class CodeGenFacade {
  private registry: IGeneratorRegistry;

  constructor(registry: IGeneratorRegistry = generatorRegistry) {
    this.registry = registry;
  }

  public getRegistry(): IGeneratorRegistry {
    return this.registry;
  }

  public async generate(prompt: string, preferences: Record<string, any> = {}): Promise<{
    context: IGenerationContext;
    report: GenerationReport;
  }> {
    const startTime = Date.now();
    logger.info(`[CodeGenFacade] Starting generation facade run for prompt: "${prompt}"`);

    // 1. Validate registered generator configurations integrity
    const registered = this.registry.list();
    codeGenValidator.validateRegistry(registered);

    // 2. Initialize context
    let context: IGenerationContext = new GenerationContext()
      .withPrompt(prompt)
      .withUserPreferences(preferences);

    // 3. Assemble Pipeline Stages (Prompt -> Requirement -> Planning -> Generation -> Validation -> Reporting -> Output)
    const pipeline = pipelineEngine;
    
    // Check if stages are already added, if not, bootstrap baseline stage mappings
    // (Here we define the core execution orchestration stage)
    const runGeneratorsStage = new PipelineStage('CoreGeneratorsExecution', async (ctx) => {
      let currentCtx = ctx;
      // Sort generators by priority
      const sorted = [...registered].sort((a, b) => b.priority - a.priority);
      for (const gen of sorted) {
        currentCtx = await gen.execute(currentCtx);
      }
      return currentCtx;
    });

    // Run execution pipeline
    context = await runGeneratorsStage.execute(context);

    // 4. Generate summary report
    const modulesExecuted = registered.map(g => g.id);
    const report = reportGenerator.generate(
      startTime,
      modulesExecuted,
      [],
      [],
      context.getGeneratedArtifacts()
    );

    return {
      context,
      report
    };
  }
}

export const codeGenFacade = new CodeGenFacade();
export default codeGenFacade;
export { GenerationReport } from '../reports';
