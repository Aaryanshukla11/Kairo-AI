import { EditOperation, IncrementalEditPlan } from './editTypes';
import { editOptimizer } from './editOptimizer';
import { conflictDetector } from './conflictDetector';
import { preservationEngine } from './preservationEngine';
import { editValidator } from './editValidator';
import { editMetrics } from './editMetrics';

export class EditPlanner {
  public planEdits(
    filePath: string,
    fileContent: string,
    rawOps: EditOperation[]
  ): IncrementalEditPlan {
    const warnings = conflictDetector.detectConflicts(rawOps);

    const optimizedOps = editOptimizer.optimize(rawOps);

    editValidator.validate(optimizedOps, fileContent.length);

    const preservedRegions = preservationEngine.identifyPreservedRegions(fileContent, optimizedOps);

    let editedBytes = 0;
    for (const op of optimizedOps) {
      editedBytes += (op.range.end - op.range.start);
    }
    const preservedRatio = fileContent.length > 0 ? (fileContent.length - editedBytes) / fileContent.length : 1.0;

    const editRegions = optimizedOps.map(op => op.range);

    const plan: IncrementalEditPlan = {
      editId: `edit-plan-${Date.now()}`,
      targetFile: filePath,
      editRegions,
      patchOperations: optimizedOps,
      preservedRegions,
      validationSummary: {
        isValid: warnings.length === 0,
        errors: []
      },
      warnings,
      metrics: {
        originalSize: fileContent.length,
        patchSize: editedBytes,
        preservedRatio
      }
    };

    editMetrics.record(preservedRatio);

    return plan;
  }
}

export const editPlanner = new EditPlanner();
