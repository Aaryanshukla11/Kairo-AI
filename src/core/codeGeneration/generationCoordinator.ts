import { generationContextBuilder } from './generationContext';
import { generationPlanner } from './generationPlanner';
import { mockGenerator } from './providers/mockGenerator';
import { generationValidator } from './generationValidator';
import { generationPolicies } from './generationPolicies';
import { artifactBuilder } from './artifactBuilder';
import { outputAssembler } from './outputAssembler';
import { generationEvents } from './generationEvents';
import { generationSessionManager } from './generationSession';
import { generationMetrics } from './generationMetrics';
import { GenerationArtifact, GenEventType } from './generationTypes';

export class GenerationCoordinator {
  public async coordinate(plan: any): Promise<GenerationArtifact> {
    const startTime = Date.now();
    generationEvents.emit(GenEventType.GenerationStarted, { plan });

    try {
      generationValidator.validatePlan(plan);

      const context = generationContextBuilder.buildContext(plan);
      generationValidator.validateContext(context);
      generationPolicies.verifyPolicies(context);
      generationEvents.emit(GenEventType.ContextPrepared, { context });

      const strategy = generationPlanner.selectStrategy(plan);
      generationValidator.validateStrategy(strategy);

      const sessionId = generationSessionManager.createSession(context.planId);

      const files = await mockGenerator.generate(context, strategy, plan);
      generationEvents.emit(GenEventType.ArtifactGenerated, { files });

      const rawArtifact = artifactBuilder.buildArtifact(files, strategy, Date.now() - startTime);
      generationValidator.validateArtifact(rawArtifact);
      generationEvents.emit(GenEventType.ValidationCompleted, { artifact: rawArtifact });

      const finalArtifact = outputAssembler.assemble(rawArtifact);

      generationSessionManager.completeSession(sessionId, 'completed');
      generationMetrics.record(finalArtifact.metrics.linesCount, finalArtifact.metrics.durationMs);
      generationEvents.emit(GenEventType.GenerationCompleted, { artifact: finalArtifact });

      return finalArtifact;
    } catch (err: any) {
      generationEvents.emit(GenEventType.GenerationFailed, { error: err.message });
      throw err;
    }
  }
}

export const generationCoordinator = new GenerationCoordinator();
