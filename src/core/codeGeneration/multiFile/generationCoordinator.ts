import { filePlanner } from './filePlanner';
import { dependencyPlanner } from './dependencyPlanner';
import { orderingEngine } from './orderingEngine';
import { artifactAssembler } from './artifactAssembler';
import { consistencyValidator } from './consistencyValidator';
import { multiFileEvents } from './generationEvents';
import { multiFileMetrics } from './generationMetrics';
import { MultiFilePlan, MultiFileEventType } from './generationTypes';

export class GenerationCoordinator {
  public async coordinate(plan: any): Promise<MultiFilePlan> {
    const startTime = Date.now();
    multiFileEvents.emit(MultiFileEventType.GenerationPlanningStarted, { plan });

    try {
      const plannedOps = filePlanner.planFiles(plan);
      const affectedFiles = plannedOps.map(op => op.filePath);
      for (const file of affectedFiles) {
        multiFileEvents.emit(MultiFileEventType.FileDiscovered, { file });
      }

      const dependenciesPlanned = dependencyPlanner.planDependencies(plannedOps);
      multiFileEvents.emit(MultiFileEventType.DependencyResolved, { operations: dependenciesPlanned });

      const dependencyOrder = orderingEngine.computeOrder(dependenciesPlanned);

      consistencyValidator.validateOperations(dependenciesPlanned);

      const generatedArtifacts = artifactAssembler.assemble(dependenciesPlanned);
      multiFileEvents.emit(MultiFileEventType.ArtifactGenerated, { artifacts: generatedArtifacts });

      const multiPlan: MultiFilePlan = {
        generationId: `multi-plan-${Date.now()}`,
        affectedFiles,
        creationOrder: dependencyOrder,
        dependencyOrder,
        generatedArtifacts,
        validationSummary: {
          isValid: true,
          errors: []
        },
        warnings: [],
        metrics: {
          filesCount: affectedFiles.length,
          durationMs: Date.now() - startTime
        }
      };

      consistencyValidator.validateGraph(dependenciesPlanned, dependencyOrder);
      multiFileEvents.emit(MultiFileEventType.ConsistencyValidated, { plan: multiPlan });

      multiFileMetrics.record(affectedFiles.length);
      multiFileEvents.emit(MultiFileEventType.GenerationCompleted, { plan: multiPlan });

      return multiPlan;
    } catch (err: any) {
      throw err;
    }
  }
}

export const generationCoordinator = new GenerationCoordinator();
