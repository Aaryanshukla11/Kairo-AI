import { IPipeline, IPipelineStage, IGenerationContext } from '../interfaces';
import { PipelineError } from '../errors';
import { logger } from '../logger';
import { eventBus } from '../events';

export class PipelineStage implements IPipelineStage {
  public readonly name: string;
  private readonly executor: (context: IGenerationContext) => Promise<IGenerationContext>;

  constructor(name: string, executor: (context: IGenerationContext) => Promise<IGenerationContext>) {
    this.name = name;
    this.executor = executor;
  }

  public async execute(context: IGenerationContext): Promise<IGenerationContext> {
    logger.info(`[PipelineStage] Running stage: ${this.name}...`);
    eventBus.publish('PipelineStageStarted', { stage: this.name });
    try {
      const nextCtx = await this.executor(context);
      eventBus.publish('PipelineStageCompleted', { stage: this.name });
      return nextCtx;
    } catch (err: any) {
      eventBus.publish('PipelineStageFailed', { stage: this.name, error: err.message });
      throw new PipelineError(
        `Execution failed in stage '${this.name}': ${err.message}`,
        `PipelineStage:${this.name}`,
        'Verify context variables, parameters formats, or model configurations.'
      );
    }
  }
}

export class PipelineEngine implements IPipeline {
  private stages: IPipelineStage[] = [];

  public addStage(stage: IPipelineStage): void {
    this.stages.push(stage);
    logger.debug(`[PipelineEngine] Stage added: ${stage.name}`);
  }

  public async execute(context: IGenerationContext): Promise<IGenerationContext> {
    logger.info('[PipelineEngine] Starting code generation pipeline execution...');
    eventBus.publish('PipelineStarted', { stagesCount: this.stages.length });

    let currentContext = context;
    for (const stage of this.stages) {
      currentContext = await stage.execute(currentContext);
    }

    logger.info('[PipelineEngine] Code generation pipeline completed successfully.');
    eventBus.publish('PipelineCompleted', {});
    return currentContext;
  }
}

export const pipelineEngine = new PipelineEngine();
export default pipelineEngine;
